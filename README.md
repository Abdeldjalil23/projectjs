# MedSuite

منصة داخلية لمركز الطب لدى سوناطراك، يستعملها الطاقم: الإدارة، الأطباء، طبيب الأسنان، والمساعد الاجتماعي.

> **حالة المشروع:** تسجيل الدخول يتحقق من الحسابات عبر Supabase متى وُضعت مفاتيحه في `.env.local`، وبدونها يعمل دخول تجريبي يختار فيه المستخدم دوره. أما البيانات داخل الصفحات فما زالت تجريبية ومكتوبة داخل الكود. لا تُدخل أي بيانات حقيقية.

## التقنيات

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- النشر: Vercel، تلقائياً من الفرع `main`، مع رابط معاينة لكل فرع

## التشغيل المحلي

يتطلب Node.js 20.19 أو أحدث (نسخة LTS).

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:8080`.

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | التشغيل للتطوير |
| `npm run build` | بناء نسخة النشر في `dist/` |
| `npm run preview` | تجربة نسخة النشر محلياً |
| `npm run lint` | فحص الكود |

## الخادم

خطوات إعداد Supabase (الجداول، أول حساب إدارة، المفاتيح) في [docs/SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md).

## الأدوار ولوحاتها

| الدور | اللوحة |
| --- | --- |
| Admin | `/admin/dashboard` |
| Doctor | `/medecin/dashboard` |
| Dentist | `/dentist/dashboard` |
| Social | `/social/dashboard` |

كل دور يُحوَّل إلى لوحته إذا حاول فتح صفحات دور آخر.

## هيكل المجلدات

```
src/
  pages/        صفحات كل دور (admin, medecin, dentist, social)
  components/   المكوّنات (dashboard, layout, ui ...)
  context/      حالة تسجيل الدخول
  lib/          أدوات مشتركة (الأدوار ...)
```

## طريقة العمل

1. لا عمل مباشر على `main`.
2. فرع لكل مهمة انطلاقاً من `main`: `feature/...` أو `fix/...` أو `chore/...`
3. Pull Request صغير، يجرّبه الشريك على رابط معاينة Vercel.
4. الدمج بخيار **Create a merge commit**.
