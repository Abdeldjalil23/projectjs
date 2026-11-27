# واجهة طلبات التكفل (API)

هذه العمليات تستعملها المنصة اليوم، وسيستعملها تطبيق العامل في المرحلة 5 بنفس الطريقة. كلها تمر عبر Supabase (PostgREST)، والقواعد مفروضة في قاعدة البيانات نفسها: ملف `supabase/migrations/20261127000001_care_requests.sql`.

## مسار الطلب

```
pending (قيد المراجعة) ──قبول──▶ approved (صالح) ──استعمال──▶ used (مستعمل)
        │                              │
        └──رفض مع سبب──▶ refused       └──مرور valid_until──▶ expired (منتهي)
```

- `used` و`expired` لا تُخزَّنان: تُحسبان من `used_at` و`valid_until`، فتبقيان صحيحتين دون مهمة مجدولة. الدالة `care_request_state(r)` تحسبهما في الخادم، و`careState()` في `src/lib/careRequests.ts` تحسبهما بنفس الطريقة في الواجهة.
- لا يُعدَّل الطلب ولا يُحذف من الواجهة: القبول والرفض والاستعمال تمر عبر الدوال أدناه فقط، وكل تغيير يُسجَّل في `audit_log`.

## الإعدادات (`app_settings`)

| المفتاح | القيمة الافتراضية | المعنى |
| --- | --- | --- |
| `care_request_validity_days` | `30` | عدد أيام صلاحية التكفل بعد قبوله |
| `care_request_single_use` | `true` | التكفل يُستعمل مرة واحدة. إذا كان `false` يبقى صالحاً حتى انتهاء مدته مهما استُعمل |
| `care_request_refusal_reasons` | `["Dossier incomplet", "Hors convention", "Prestation non couverte", "Autre"]` | الأسباب المقترحة عند الرفض |

## الجداول

### `contracted_doctors`: الأطباء المتعاقدون

| العمود | النوع | ملاحظة |
| --- | --- | --- |
| `id` | uuid | |
| `full_name` | text | إجباري |
| `specialty` | text | إجباري |
| `address`، `phone`، `notes` | text | اختيارية |
| `active` | boolean | لا تُوجَّه الطلبات الجديدة إلا للأطباء النشطين. لا حذف، بل تعطيل |

القراءة: `care_requests.read` أو `care_requests.create` أو `contracted_doctors.manage`. الإضافة والتعديل: `contracted_doctors.manage` (الإدارة افتراضياً).

### `care_requests`: الطلبات

| العمود | من يملؤه | ملاحظة |
| --- | --- | --- |
| `number` | الخادم | `PEC-2026-00001`، تسلسل سنوي دون فجوات |
| `beneficiary_id`، `contracted_doctor_id` | صاحب الطلب | المستفيد والطبيب يجب أن يكونا نشطين |
| `prestation` | صاحب الطلب | الخدمة بعبارة إدارية، **دون تشخيص** (الإدارة تقرأها) |
| `notes` | صاحب الطلب | اختياري |
| `source` | الخادم | `platform` الآن، `app` لتطبيق العامل لاحقاً |
| `status` | الخادم | `pending` ثم `approved` أو `refused` |
| `requester_name`، `reviewer_name`، `reviewed_at` | الخادم | |
| `refusal_reason` | المراجِع | إجباري عند الرفض |
| `qr_token` | الخادم | 64 حرفاً عشوائياً عند القبول، لا يحمل أي معلومة |
| `valid_until` | الخادم | آخر يوم صالح، بتوقيت الجزائر |
| `used_at`، `use_count` | الخادم | تاريخ أول استعمال وعدد مرات الاستعمال |

القراءة: `care_requests.read`. الإنشاء: `care_requests.create`، ولا تُرسَل إلا الأعمدة الأربعة: `beneficiary_id` و`contracted_doctor_id` و`prestation` و`notes`. أي عمود آخر يرفضه الخادم.

## العمليات

### إنشاء طلب

```ts
await supabase.from('care_requests')
  .insert({ beneficiary_id, contracted_doctor_id, prestation, notes })
  .select('id, number')
  .single();
```

### مراجعة طلب: `review_care_request(p_id, p_approve, p_reason)`

يتطلب `care_requests.review`. يعمل فقط على طلب `pending`.

```ts
await supabase.rpc('review_care_request', { p_id: id, p_approve: true });   // قبول
await supabase.rpc('review_care_request', { p_id: id, p_approve: false, p_reason: 'Hors convention' });   // رفض
```

يعيد سطر الطلب بعد التعديل. عند القبول يُنشأ `qr_token` و`valid_until`.

### التحقق من رمز QR: `verify_care_request(p_token)`

**مفتوحة دون حساب** (anon). يحمل رمز QR الرابط `https://<الموقع>/verify/<token>`.

```ts
const { data } = await supabase.rpc('verify_care_request', { p_token: token });
// [] إذا كان الرمز غير معروف، وإلا سطر واحد:
// { number, state: 'approved' | 'used' | 'expired', beneficiary_name, beneficiary_number,
//   doctor_name, doctor_specialty, valid_until, used_at, use_count }
```

لا تعيد أي معلومة طبية، ولا حتى الخدمة المطلوبة: فقط الصلاحية، واسم المستفيد ورقمه للمقارنة مع وثيقة الهوية، والطبيب الموجَّه إليه.

### تسجيل الاستعمال: `use_care_request(p_token)`

**مفتوحة دون حساب** (anon). يستعملها الطبيب المتعاقد بعد استقبال الشخص. تُرجع نفس السطر بعد التسجيل، أو خطأ:

| رسالة الخطأ | المعنى |
| --- | --- |
| `Unknown care coverage` | الرمز لا يطابق أي تكفل مقبول |
| `This care coverage has already been used` | استُعمل من قبل (وضع الاستعمال الواحد) |
| `This care coverage has expired` | تجاوز `valid_until` |

## لتطبيق العامل (المرحلة 5)

- يحتاج العامل حساباً مربوطاً بسجله في `beneficiaries`، وصلاحيات خاصة لا ترى إلا طلباته: سياسة RLS جديدة على `care_requests` بشرط `beneficiary_id` = سجل العامل.
- الإنشاء من التطبيق يضع `source = 'app'`: يحتاج دالة أو سياسة خاصة، لأن هذا العمود غير متاح للإرسال اليوم.
- الإشعارات عند تغيّر الحالة: جدول `notifications` في المرحلة 5، يملؤه trigger على `care_requests` عند تغيّر `status`.
