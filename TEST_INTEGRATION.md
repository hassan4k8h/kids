# اختبار التكامل - دليل التحقق السريع

## 🧪 خطوات الاختبار السريع

بعد إعداد التطبيق (راجع `SETUP_AND_RUN_GUIDE.md`)، اتبع هذه الخطوات للتأكد من عمل كل شيء:

### 1. اختبار التسجيل والمصادقة ✅

```bash
# تشغيل التطبيق
npm run dev
```

1. **اختبار التسجيل الجديد:**
   - انتقل إلى صفحة التسجيل
   - أدخل إيميل جديد وكلمة مرور
   - تأكد من ظهور رسالة "تم التسجيل بنجاح"
   - افتح Supabase Dashboard > Table Editor > `users`
   - تأكد من ظهور المستخدم الجديد

2. **اختبار تسجيل الدخول:**
   - سجل خروج ثم حاول تسجيل الدخول مرة أخرى 
   - تأكد من نجاح العملية

### 2. اختبار إنشاء ملف الطفل ✅

1. **إنشاء طفل جديد:**
   - بعد تسجيل الدخول، انتقل لإنشاء ملف طفل
   - أدخل الاسم واختر أفاتار
   - تأكد من حفظ البيانات
   - افتح Supabase Dashboard > Table Editor > `players`
   - تأكد من ظهور الطفل مرتبط بـ `user_id` الصحيح

### 3. اختبار حفظ تقدم الألعاب ✅

1. **العب أي لعبة:**
   - اختر طفل والعب أي لعبة
   - احصل على نقاط
   - أنهي اللعبة
   - افتح Supabase Dashboard > Table Editor > `game_scores`
   - تأكد من حفظ النتيجة

2. **تحقق من تحديث بيانات اللاعب:**
   - في جدول `players` تأكد من تحديث `experience` و `coins`

### 4. اختبار المزامنة عبر الأجهزة 🔄

1. **افتح التطبيق في نافذة أخرى:**
   - سجل دخول بنفس الحساب
   - تأكد من ظهور نفس الأطفال والتقدم

2. **العب في نافذة واحدة:**
   - احرز نقاط جديدة
   - انتقل للنافذة الأخرى وحدث الصفحة
   - تأكد من ظهور التقدم الجديد

## 🔍 فحص قاعدة البيانات

### التحقق من الجداول:
```sql
-- في Supabase SQL Editor
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as player_count FROM players;
SELECT COUNT(*) as score_count FROM game_scores;
```

### التحقق من الربط:
```sql
-- التأكد من ربط اللاعبين بالمستخدمين
SELECT 
  u.email, 
  u.name as parent_name,
  p.name as child_name,
  p.level,
  p.experience
FROM users u
JOIN players p ON u.id = p.user_id;
```

## 🚨 علامات المشاكل المحتملة

### إذا لم تُحفظ البيانات:
- تحقق من Console للأخطاء
- تأكد من متغيرات البيئة
- تأكد من تنفيذ `database/setup.sql`

### إذا لم يعمل التسجيل:
- تحقق من Supabase Auth settings
- تأكد من تفعيل Email authentication
- راجع Network tab في Developer Tools

## 📊 إحصائيات النجاح

بعد الاختبار، يجب أن ترى:

```sql
-- إحصائيات سريعة
WITH stats AS (
  SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM players) as total_players,
    (SELECT COUNT(*) FROM game_scores) as total_games_played,
    (SELECT AVG(experience) FROM players) as avg_experience
)
SELECT * FROM stats;
```

## ✅ قائمة التحقق النهائية

- [ ] تسجيل المستخدمين يعمل
- [ ] تسجيل الدخول والخروج يعمل  
- [ ] إنشاء ملفات الأطفال يعمل
- [ ] حفظ نتائج الألعاب يعمل
- [ ] تحديث الخبرة والعملات يعمل
- [ ] المزامنة عبر الأجهزة تعمل
- [ ] البيانات محفوظة في Supabase
- [ ] لا توجد أخطاء في Console

## 🎉 النجاح!

إذا اجتازت جميع الاختبارات، فالتطبيق جاهز للإنتاج! 🚀

**ملاحظة**: يمكن تشغيل هذه الاختبارات بشكل دوري للتأكد من استقرار النظام.