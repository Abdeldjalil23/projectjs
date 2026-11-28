# إعداد الخادم (Supabase)

هذا الإعداد للنسخة التجريبية فقط، **ببيانات وهمية**. النسخة النهائية ستُثبَّت على خوادم الشركة بنفس الملفات (Supabase مفتوح المصدر ويمكن تثبيته ذاتياً).

## 1. إنشاء المشروع

1. على [supabase.com](https://supabase.com): **New project**، واختر أقرب منطقة أوروبية.
2. احفظ كلمة مرور قاعدة البيانات في مكان آمن، ولا تضعها في المستودع.
3. **Authentication ← Sign In / Providers**: أوقف **Allow new users to sign up**. الحسابات تُنشأ من الإدارة فقط.

## 2. إنشاء الجداول

شغّل ملفات المجلد `supabase/migrations/` واحداً واحداً بترتيب أسمائها. لكل ملف: افتحه في المحرر، وانسخ **كل محتواه** (Ctrl+A ثم Ctrl+C)، ثم في **SQL Editor** افتح صفحة جديدة (+)، والصق، واضغط **Run**. النتيجة المتوقعة: `Success. No rows returned`.

| الملف | ما يفعله |
| --- | --- |
| `20261122000001_core_access.sql` | الأدوار، الصلاحيات، ملفات المستخدمين، الإعدادات، وسجل التدقيق، مع الصلاحيات الافتراضية لكل دور |
| `20261122000002_api_grants.sql` | يحدد بدقة ما يصل إليه المستخدم المسجَّل عبر الواجهة، ولا شيء لغير المسجَّل |
| `20261123000001_account_safeguards.sql` | يمنع أي مستخدم من تغيير دوره أو تعطيل حسابه بنفسه، ويُبقي لدور الإدارة صلاحيتَي إدارة الحسابات والصلاحيات |
| `20261126000001_beneficiaries.sql` | جدول المستفيدين (العمال، ذوو الحقوق، المتقاعدون...) وربط ذوي الحقوق بعمالهم، ووظيفة الاستيراد من ملف |
| `20261126000002_medical_record.sql` | الملف الطبي: معلومات عامة، المناصب ومخاطرها، السوابق، التسممات، حوادث العمل، التلقيحات (للفريق الطبي فقط) |
| `20261126000003_visits.sql` | زيارات طب العمل وقرار الأهلية (للأطباء فقط)، ومواعيد الزيارات وقائمة الزيارات المستحقة (بدون أي معلومة طبية) |
| `20261126000004_consultations.sql` | الاستشارات لكل مصلحة (طب عام، تمريض، أسنان، نفساني) والأعمال المنجزة، والوثائق الطبية السبع بأرقام تسلسلية لا تُعدَّل بعد تحريرها (تُلغى فقط مع ذكر السبب) |
| `20261126000005_medicines.sql` | مخزون الأدوية: الدخول والصرف والتصحيح والإتلاف، والمخزون يحسبه الخادم ولا ينزل تحت الصفر، دون ذكر أي مريض |
| `20261127000001_care_requests.sql` | الأطباء المتعاقدون وطلبات التكفل: الطلب، قبوله أو رفضه، رمز QR عشوائي، وصفحة تحقق عامة تعرض الصلاحية فقط وتسجّل الاستعمال (انظر [API-CARE-REQUESTS.md](API-CARE-REQUESTS.md)) |
| `20261128000001_reports.sql` | التقارير: التقرير الشهري لـCMS والحصيلة الفصلية لطب العمل، أعداد فقط تُحسب مما سُجّل، لمن يملك `reports.read` |
| `20261129000001_worker_app.sql` | تطبيق العامل: حسابات العمال ورموز التفعيل، وما يصل إليه العامل عبر وظائف `worker_*` فقط (عائلته، طلباته، الأطباء، المواعيد)، والإشعارات عند كل تغيّر في الطلب |

إذا ظهر تحذير عن «destructive operations» فوافق عليه: سببه عبارات مثل `on delete cascade` و`revoke`، ولا يُحذف شيء.

> كل تعديل لاحق على الجداول يكون بملف جديد في `supabase/migrations/`، وليس بالتعديل اليدوي من لوحة التحكم.

## 3. أول حساب إدارة

نفّذ هذه الخطوة **بعد** الخطوة 2، لأن الجداول هي التي تنشئ ملف الحساب تلقائياً.

1. **Authentication ← Users ← Add user ← Create new user**
   - Email: `<المعرّف>@staff.medsuite.local` بحروف صغيرة (مثال: `admin@staff.medsuite.local`)
   - كلمة مرور قوية، وفعّل **Auto Confirm User**.
2. في **SQL Editor**، افتح صفحة جديدة (+)، واستبدل المعرّف والاسم، ثم نفّذ:

```sql
update public.profiles
set staff_id = 'admin',
    full_name = 'الاسم الكامل',
    role_id = (select id from public.roles where code = 'admin'),
    active = true
where id = (select id from auth.users where email = 'admin@staff.medsuite.local');

select staff_id, full_name, active from public.profiles;
```

يجب أن يظهر سطر واحد فيه `true`. الدخول إلى المنصة يكون بالمعرّف (`admin` في المثال) وكلمة المرور.

بعدها تُنشأ بقية الحسابات من داخل المنصة.

## 4. وظيفة إدارة الحسابات (Edge Function)

شاشة **Staff accounts** تحتاجها لإنشاء الحسابات وإعادة تعيين كلمات المرور. أما تعديل الدور والتعطيل وشاشة الصلاحيات فتعمل بدونها.

من مجلد المشروع:

```bash
npx supabase login
npx supabase functions deploy admin-users --remote=<project-ref> --no-verify-jwt
```

- `project-ref` هو الجزء الأول من رابط المشروع: `https://<project-ref>.supabase.co`. (النسخ القديمة من أداة Supabase تستعمل `--project-ref <project-ref>` بدل `--remote`.)
- التحذير `Docker is not running` عادي: الرفع يتم بدون Docker.
- كل تعديل على ملف الوظيفة يحتاج إعادة نفس الأمر.
- `--no-verify-jwt` ضروري: الوظيفة تتحقق بنفسها من هوية المستخدم ومن صلاحية `users.manage`.
- لا تحتاج إلى نسخ أي مفتاح: Supabase يعطي الوظيفة مفاتيحها تلقائياً.

## 5. ربط الواجهة

1. انسخ `.env.example` إلى `.env.local` واملأ القيمتين من **Project Settings ← API Keys**:
   - `VITE_SUPABASE_URL`: رابط المشروع.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: المفتاح العام الذي يبدأ بـ`sb_publishable_`.
2. أعد تشغيل `npm run dev`. بدون القيمتين تعرض شاشة الدخول رسالة «الخادم غير مُعدّ» ولا يمكن الدخول، فلا يوجد دخول تجريبي.
3. على Vercel: **Settings ← Environment Variables**، أضف نفس القيمتين ثم أعد النشر. هذه الخطوة يقوم بها صاحب مشروع Vercel، وبدونها لا يدخل أحد إلى الموقع المنشور.

> المشاريع القديمة في Supabase تسمّي المفتاح العام `anon`. المتغير القديم `VITE_SUPABASE_ANON_KEY` ما زال مقبولاً.

## 6. تطبيق العامل (Edge Function `worker-access`)

يحتاجها العامل ليفعّل حسابه بالرمز الذي يسلّمه له المركز. تُضاف من المتصفح، حتى من الهاتف، دون أي أداة:

1. في لوحة Supabase: **Edge Functions ← Deploy a new function ← Via Editor**.
2. الاسم: `worker-access` (بالضبط).
3. امسح المثال، والصق كل محتوى الملف `supabase/functions/worker-access/index.ts`، ثم **Deploy function**.
4. افتح الوظيفة ← **Details** (أو Settings)، وأوقف **Enforce JWT verification** (Verify JWT)، ثم احفظ. هذا ضروري: العامل لا يملك حساباً بعد حين يفعّله، والوظيفة تتحقق بنفسها من الرقم والرمز.

أو من الحاسوب: `npx supabase functions deploy worker-access --remote=<project-ref> --no-verify-jwt`.

**أرقام الاتصال في التطبيق** (صفحة Contacts): تُعدَّل من المنصة في **Paramètres du centre**. أو في **SQL Editor**، مع تغيير الأرقام:

```sql
update public.app_settings
set value = '[
  {"label": "Accueil du centre médical", "phone": "029 00 00 00", "hours": "Dimanche – jeudi, 8 h – 16 h"},
  {"label": "Infirmerie (urgences)", "phone": "029 00 00 01", "hours": "24 h / 24"}
]'
where key = 'worker_contacts';
```

## قواعد لا استثناء فيها

- المفتاح السري **Secret key** (`sb_secret_...`، أو `service_role` في المشاريع القديمة) لا يُرسل لأحد، ولا يوضع في الواجهة ولا في المستودع.
- لا بيانات عمال حقيقية قبل الموافقة الرسمية والتثبيت على خوادم الشركة.
- الصلاحيات قابلة للتعديل من جدول `role_permissions`، وكل تعديل يُسجَّل في `audit_log`.
