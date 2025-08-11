# حل مشكلة قاعدة البيانات - جدول 'players' غير موجود

## 🚨 المشكلة
تظهر الأخطاء التالية في التطبيق:
```
Error fetching player: {code: 42P01, details: null, hint: null, message: relation "public.players" does not exist}
Error fetching players: {code: 42P01, details: null, hint: null, message: relation "public.players" does not exist}
```

## 🔍 السبب
جدول `players` وباقي الجداول المطلوبة غير موجودة في قاعدة بيانات Supabase. يجب تنفيذ ملف `setup.sql` لإنشاء الجداول.

## ✅ الحل

### الخطوة 1: الوصول إلى Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل الدخول إلى حسابك
3. اختر المشروع: `qzdxajrvrlkudkoeinoy`

### الخطوة 2: فتح SQL Editor
1. في لوحة التحكم، انقر على **"SQL Editor"** من القائمة الجانبية
2. انقر على **"New query"**

### الخطوة 3: تنفيذ ملف setup.sql
1. افتح ملف `database/setup.sql` من مجلد المشروع
2. انسخ **كامل** محتوى الملف (264 سطر)
3. الصق المحتوى في SQL Editor
4. انقر على **"Run"** أو اضغط `Ctrl + Enter`

### الخطوة 4: التحقق من النتائج
يجب أن ترى رسالة نجاح وإنشاء الجداول التالية:
- ✅ `players` - بيانات اللاعبين
- ✅ `game_scores` - نتائج الألعاب  
- ✅ `achievements` - الإنجازات المتاحة
- ✅ `player_achievements` - إنجازات اللاعبين
- ✅ `player_settings` - إعدادات اللاعبين
- ✅ `play_sessions` - جلسات اللعب
- ✅ `subscriptions` - الاشتراكات

### الخطوة 5: التحقق من Table Editor
1. اذهب إلى **"Table Editor"** في القائمة الجانبية
2. تأكد من وجود جميع الجداول المذكورة أعلاه

## 🔧 إعدادات Supabase الحالية
```
Project URL: https://qzdxajrvrlkudkoeinoy.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 اختبار الحل
بعد تنفيذ الخطوات:
1. أعد تشغيل التطبيق (`npm run dev`)
2. افتح التطبيق في المتصفح
3. يجب أن تختفي أخطاء قاعدة البيانات
4. يجب أن تعمل وظائف اللاعبين بشكل طبيعي

## 📋 البيانات التي سيتم إنشاؤها
- **16 إنجاز أساسي** مع أيقونات ومكافآت
- **وظائف مساعدة** لإدارة العملات والخبرة
- **فهارس** لتحسين الأداء
- **سياسات أمان** (RLS) مفتوحة للتطوير

## 🚨 ملاحظات مهمة
1. **لا تغلق** SQL Editor حتى ترى رسالة النجاح
2. **تأكد** من نسخ الملف كاملاً (264 سطر)
3. **لا تنفذ** الملف أكثر من مرة لتجنب التضارب
4. **احفظ** نسخة احتياطية من البيانات إذا كان لديك بيانات مهمة

## 🔗 روابط مفيدة
- [دليل إعداد قاعدة البيانات](./DATABASE_SETUP.md)
- [وثائق Supabase SQL](https://supabase.com/docs/guides/database)
- [مشروع Supabase](https://supabase.com/dashboard/project/qzdxajrvrlkudkoeinoy)

---

**بعد تنفيذ هذه الخطوات، ستعمل جميع وظائف قاعدة البيانات بشكل طبيعي! 🎉**