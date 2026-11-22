# إعداد الخادم (Supabase)

هذا الإعداد للنسخة التجريبية فقط، **ببيانات وهمية**. النسخة النهائية ستُثبَّت على خوادم الشركة بنفس الملفات (Supabase مفتوح المصدر ويمكن تثبيته ذاتياً).

## 1. إنشاء المشروع

1. على [supabase.com](https://supabase.com): **New project**، واختر أقرب منطقة أوروبية.
2. احفظ كلمة مرور قاعدة البيانات في مكان آمن، ولا تضعها في المستودع.
3. **Authentication ← Sign In / Providers**: أوقف **Allow new users to sign up**. الحسابات تُنشأ من الإدارة فقط.

## 2. إنشاء الجداول

افتح **SQL Editor**، والصق محتوى الملف:

```
supabase/migrations/20261122000001_core_access.sql
```

ثم **Run**. الملف ينشئ: الأدوار، الصلاحيات، ملفات المستخدمين، الإعدادات، وسجل التدقيق، مع الصلاحيات الافتراضية لكل دور.

> كل تعديل لاحق على الجداول يكون بملف جديد في `supabase/migrations/`، وليس بالتعديل اليدوي من لوحة التحكم.

## 3. أول حساب إدارة

1. **Authentication ← Users ← Add user ← Create new user**
   - Email: `<المعرّف>@staff.medsuite.local` (مثال: `1234h@staff.medsuite.local`)
   - كلمة مرور قوية، وفعّل **Auto Confirm User**.
2. في **SQL Editor**، استبدل المعرّف ثم نفّذ:

```sql
update public.profiles
set staff_id = '1234H',
    full_name = 'الاسم الكامل',
    role_id = (select id from public.roles where code = 'admin'),
    active = true
where id = (select id from auth.users where email = '1234h@staff.medsuite.local');
```

بعدها تُنشأ بقية الحسابات من داخل المنصة.

## 4. وظيفة إدارة الحسابات (Edge Function)

من مجلد المشروع:

```bash
npx supabase login
npx supabase functions deploy admin-users --project-ref <project-ref>
```

`project-ref` هو الجزء الأول من رابط المشروع: `https://<project-ref>.supabase.co`.

## 5. ربط الواجهة

1. انسخ `.env.example` إلى `.env.local` واملأ القيمتين من **Project Settings ← API**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (المفتاح العام anon / publishable)
2. على Vercel: **Settings ← Environment Variables**، أضف نفس القيمتين. هذه الخطوة يقوم بها صاحب مشروع Vercel.

## قواعد لا استثناء فيها

- مفتاح **service_role** لا يُرسل لأحد، ولا يوضع في الواجهة ولا في المستودع.
- لا بيانات عمال حقيقية قبل الموافقة الرسمية والتثبيت على خوادم الشركة.
- الصلاحيات قابلة للتعديل من جدول `role_permissions`، وكل تعديل يُسجَّل في `audit_log`.
