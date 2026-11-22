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

من مجلد المشروع:

```bash
npx supabase login
npx supabase functions deploy admin-users --project-ref <project-ref> --no-verify-jwt
```

- `project-ref` هو الجزء الأول من رابط المشروع: `https://<project-ref>.supabase.co`.
- `--no-verify-jwt` ضروري: الوظيفة تتحقق بنفسها من هوية المستخدم ومن صلاحية `users.manage`.
- لا تحتاج إلى نسخ أي مفتاح: Supabase يعطي الوظيفة مفاتيحها تلقائياً.

## 5. ربط الواجهة

1. انسخ `.env.example` إلى `.env.local` واملأ القيمتين من **Project Settings ← API Keys**:
   - `VITE_SUPABASE_URL`: رابط المشروع.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: المفتاح العام الذي يبدأ بـ`sb_publishable_`.
2. أعد تشغيل `npm run dev`. تختفي اختيارات الأدوار من شاشة الدخول، لأن الدور يُقرأ من حساب المستخدم.
3. على Vercel: **Settings ← Environment Variables**، أضف نفس القيمتين. هذه الخطوة يقوم بها صاحب مشروع Vercel.
   بعدها يتوقف الدخول التجريبي على الموقع المنشور، ولا يدخل إلا أصحاب الحسابات.

> المشاريع القديمة في Supabase تسمّي المفتاح العام `anon`. المتغير القديم `VITE_SUPABASE_ANON_KEY` ما زال مقبولاً.

## قواعد لا استثناء فيها

- المفتاح السري **Secret key** (`sb_secret_...`، أو `service_role` في المشاريع القديمة) لا يُرسل لأحد، ولا يوضع في الواجهة ولا في المستودع.
- لا بيانات عمال حقيقية قبل الموافقة الرسمية والتثبيت على خوادم الشركة.
- الصلاحيات قابلة للتعديل من جدول `role_permissions`، وكل تعديل يُسجَّل في `audit_log`.
