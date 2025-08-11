# دليل النشر - Kids Educational Game

## 📋 المتطلبات الأساسية

- حساب على [Netlify](https://netlify.com) أو [Vercel](https://vercel.com)
- مشروع Supabase مُعد ومُفعل
- كود المشروع على GitHub/GitLab/Bitbucket

## 🚀 النشر على Netlify

### الخطوة 1: ربط المستودع
1. سجل الدخول إلى Netlify
2. اضغط على "New site from Git"
3. اختر مزود Git (GitHub/GitLab/Bitbucket)
4. اختر مستودع المشروع

### الخطوة 2: إعدادات البناء
```
Build Command: npm run build
Publish Directory: dist
Node Version: 18
```

### الخطوة 3: متغيرات البيئة
أضف المتغيرات التالية في Site Settings > Environment Variables:
```
VITE_SUPABASE_URL=https://zwwyifnikprfbdikskvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d3lpZm5pa3ByZmJkaWtza3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU3MjUsImV4cCI6MjA2OTEwMTcyNX0.Z1BwlFF37xjSpuRVDhFSKCQJOZdAQayY1JYRVotu3NE
NODE_ENV=production
```

### الخطوة 4: النشر
- اضغط "Deploy site"
- انتظر اكتمال عملية البناء
- الموقع سيكون متاحاً على رابط Netlify

---

## 🚀 النشر على Vercel

### الخطوة 1: ربط المستودع
1. سجل الدخول إلى Vercel
2. اضغط على "New Project"
3. استورد مستودع Git
4. اختر مشروع Kids Educational Game

### الخطوة 2: إعدادات البناء (تلقائية)
Vercel سيكتشف إعدادات Vite تلقائياً من ملف `vercel.json`:
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### الخطوة 3: متغيرات البيئة
أضف المتغيرات في Project Settings > Environment Variables:
```
VITE_SUPABASE_URL=https://zwwyifnikprfbdikskvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d3lpZm5pa3ByZmJkaWtza3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU3MjUsImV4cCI6MjA2OTEwMTcyNX0.Z1BwlFF37xjSpuRVDhFSKCQJOZdAQayY1JYRVotu3NE
```

### الخطوة 4: النشر
- اضغط "Deploy"
- انتظر اكتمال عملية البناء
- الموقع سيكون متاحاً على رابط Vercel

---

## 🔧 إعداد قاعدة البيانات Supabase

### معلومات الاتصال
```
Project URL: https://zwwyifnikprfbdikskvg.supabase.co
API Key (anon): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d3lpZm5pa3ByZmJkaWtza3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU3MjUsImV4cCI6MjA2OTEwMTcyNX0.Z1BwlFF37xjSpuRVDhFSKCQJOZdAQayY1JYRVotu3NE
```

### إعداد الجداول المطلوبة
1. افتح Supabase Dashboard
2. انتقل إلى Table Editor
3. قم بتشغيل ملف `database/setup.sql` لإنشاء الجداول
4. فعّل Row Level Security (RLS) للجداول الحساسة

---

## 📁 الملفات المُضافة للنشر

- `.env.production` - متغيرات البيئة للإنتاج
- `netlify.toml` - إعدادات Netlify
- `vercel.json` - إعدادات Vercel
- `DEPLOYMENT_INSTRUCTIONS.md` - هذا الدليل

---

## ✅ التحقق من النشر

### اختبار الوظائف الأساسية:
1. تسجيل الدخول/إنشاء حساب
2. إنشاء ملف شخصي للطفل
3. تشغيل الألعاب
4. قراءة القصص
5. حفظ التقدم

### مراقبة الأداء:
- تحقق من سرعة التحميل
- اختبر على أجهزة مختلفة
- تأكد من عمل PWA

---

## 🔒 الأمان

- جميع المفاتيح المستخدمة هي مفاتيح عامة آمنة
- تم تفعيل Row Level Security في Supabase
- تم إضافة Headers أمنية في إعدادات النشر

---

## 📞 الدعم

في حالة مواجهة مشاكل:
1. تحقق من logs البناء
2. تأكد من صحة متغيرات البيئة
3. تحقق من اتصال Supabase
4. راجع إعدادات DNS إذا كنت تستخدم دومين مخصص