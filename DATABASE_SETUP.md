# دليل إعداد قاعدة البيانات - Supabase

## 🎯 نظرة عامة
هذا الدليل يوضح كيفية إعداد قاعدة البيانات للعبة التعليمية باستخدام Supabase.

## 📋 المتطلبات المسبقة
- حساب Supabase (مجاني)
- مشروع Supabase جديد
- معلومات الاتصال (URL و API Key)

## 🚀 خطوات الإعداد

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. قم بتسجيل الدخول أو إنشاء حساب جديد
3. انقر على "New Project"
4. اختر اسماً للمشروع وكلمة مرور قوية لقاعدة البيانات
5. اختر المنطقة الأقرب لك
6. انقر على "Create new project"

### 2. الحصول على معلومات الاتصال
1. في لوحة تحكم المشروع، اذهب إلى "Settings" > "API"
2. انسخ:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: المفتاح العام للوصول

### 3. إعداد ملف البيئة
تم إنشاء ملف `.env` تلقائياً بمعلومات الاتصال الخاصة بك:

```env
SUPABASE_URL=https://zqcxzxtybxrjjftaxitr.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_URL=https://zqcxzxtybxrjjftaxitr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. إنشاء الجداول
1. في لوحة تحكم Supabase، اذهب إلى "SQL Editor"
2. انسخ محتوى ملف `database/setup.sql`
3. الصق الكود في المحرر
4. انقر على "Run" لتنفيذ الأوامر

### 5. التحقق من الإعداد
بعد تنفيذ SQL، يجب أن ترى الجداول التالية في قسم "Table Editor":

- ✅ `players` - بيانات اللاعبين
- ✅ `game_scores` - نتائج الألعاب
- ✅ `achievements` - الإنجازات المتاحة
- ✅ `player_achievements` - إنجازات اللاعبين
- ✅ `player_settings` - إعدادات اللاعبين
- ✅ `play_sessions` - جلسات اللعب

## 🔧 الميزات المتاحة

### الجداول الأساسية

#### جدول اللاعبين (players)
- معرف فريد لكل لاعب
- الاسم والعمر والصورة الرمزية
- المستوى والخبرة والعملات
- قائمة الإنجازات
- تواريخ الإنشاء والتحديث

#### جدول النتائج (game_scores)
- ربط بمعرف اللاعب
- نوع اللعبة والنتيجة
- مستوى الصعوبة ومدة اللعب
- تاريخ إكمال اللعبة

#### جدول الإنجازات (achievements)
- اسم ووصف الإنجاز
- أيقونة ومتطلبات الحصول عليه
- مكافأة العملات

### الوظائف المساعدة

#### إضافة العملات
```sql
SELECT add_coins('player_id', 50);
```

#### إضافة الخبرة
```sql
SELECT add_experience('player_id', 100);
```

#### إحصائيات اللاعب
```sql
SELECT * FROM get_player_stats('player_id');
```

## 🔒 الأمان

### Row Level Security (RLS)
تم تفعيل RLS على جميع الجداول مع سياسات مفتوحة للتطوير.

**⚠️ مهم للإنتاج:**
يجب تحديث سياسات الأمان قبل النشر:

```sql
-- مثال: السماح للمستخدمين بالوصول لبياناتهم فقط
CREATE POLICY "Users can only access their own data" ON players
  FOR ALL USING (auth.uid() = user_id);
```

## 🧪 اختبار الاتصال

لاختبار الاتصال بقاعدة البيانات:

```javascript
import { DatabaseService } from './services/SupabaseService';

// التحقق من الاتصال
const isConnected = await DatabaseService.checkConnection();
console.log('Database connected:', isConnected);
```

## 📊 البيانات الأولية

تم إدراج 16 إنجازاً أساسياً تلقائياً:
- إنجازات عامة (أول لعبة، عاشق الألعاب، إلخ)
- إنجازات خاصة بكل لعبة (عبقري الرياضيات، خبير الحروف، إلخ)

## 🔄 النسخ الاحتياطي

### تصدير البيانات
```bash
# من لوحة تحكم Supabase
Settings > Database > Backups
```

### استيراد البيانات
```bash
# استخدام SQL Editor لاستيراد ملفات SQL
```

## 🐛 حل المشاكل

### مشكلة الاتصال
```javascript
// التحقق من متغيرات البيئة
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'موجود' : 'مفقود');
```

### خطأ في الأذونات
- تأكد من تفعيل RLS
- راجع سياسات الأمان
- تحقق من صحة API Key

### خطأ في الجداول
- تأكد من تنفيذ ملف `setup.sql` كاملاً
- راجع رسائل الخطأ في SQL Editor
- تحقق من وجود جميع الجداول المطلوبة

## 📈 مراقبة الأداء

### في لوحة تحكم Supabase
- **Database**: مراقبة استخدام قاعدة البيانات
- **API**: مراقبة طلبات API
- **Auth**: مراقبة المصادقة (إذا تم تفعيلها)
- **Storage**: مراقبة التخزين (للملفات)

### تحسين الأداء
- استخدام الفهارس المناسبة (تم إنشاؤها تلقائياً)
- تحسين استعلامات SQL
- استخدام Pagination للبيانات الكبيرة

## 🔗 روابط مفيدة

- [وثائق Supabase](https://supabase.com/docs)
- [دليل JavaScript Client](https://supabase.com/docs/reference/javascript)
- [أمثلة SQL](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 📞 الدعم

في حالة مواجهة مشاكل:
1. راجع هذا الدليل
2. تحقق من وثائق Supabase
3. راجع ملفات الخطأ في المتصفح
4. تواصل مع فريق الدعم

---

**✅ تم إعداد قاعدة البيانات بنجاح!**

يمكنك الآن البدء في استخدام اللعبة التعليمية مع قاعدة بيانات Supabase المتكاملة.