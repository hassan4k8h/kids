# دليل النشر والإدارة الشامل للمبتدئين

## 🎯 مقدمة

هذا الدليل سيعلمك خطوة بخطوة كيفية:
- إدارة النظام محلياً
- إنشاء قاعدة بيانات
- رفع المشروع على الإنترنت
- إدارة النظام بعد النشر

---

## 📋 الجزء الأول: إدارة النظام محلياً

### 1. فهم بنية المشروع

```
Kids Educational Game/
├── src/                    # ملفات الكود الأساسية
│   ├── components/         # مكونات الواجهة
│   ├── services/          # خدمات التطبيق
│   └── types/             # تعريفات الأنواع
├── package.json           # إعدادات المشروع والمكتبات
├── vite.config.ts         # إعدادات البناء
└── README.md              # وصف المشروع
```

### 2. الأوامر الأساسية

#### تشغيل المشروع محلياً:
```bash
npm run dev
```
**ماذا يحدث؟** يبدأ خادم التطوير على http://localhost:3000

#### بناء المشروع للإنتاج:
```bash
npm run build
```
**ماذا يحدث؟** ينشئ مجلد `dist` يحتوي على الملفات المحسنة للنشر

#### معاينة البناء:
```bash
npm run preview
```
**ماذا يحدث؟** يعرض النسخة المبنية محلياً للاختبار

### 3. إضافة مكتبات جديدة

```bash
# إضافة مكتبة جديدة
npm install اسم-المكتبة

# إضافة مكتبة للتطوير فقط
npm install -D اسم-المكتبة

# حذف مكتبة
npm uninstall اسم-المكتبة
```

---

## 🗄️ الجزء الثاني: إنشاء قاعدة البيانات

### الخيار الأول: Supabase (الأسهل والمجاني)

#### 1. إنشاء حساب
1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط "Start your project"
3. سجل دخول بـ GitHub أو Google
4. اضغط "New Project"

#### 2. إعداد المشروع
```
Project Name: kids-educational-game
Database Password: [كلمة مرور قوية]
Region: [اختر الأقرب لك]
```

#### 3. الحصول على مفاتيح الاتصال
بعد إنشاء المشروع، ستجد في Settings > API:
- `Project URL`
- `anon public key`
- `service_role key`

#### 4. إضافة المفاتيح للمشروع
أنشئ ملف `.env` في جذر المشروع:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 5. إنشاء الجداول
في Supabase Dashboard > SQL Editor، نفذ:

```sql
-- جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول تقدم اللعبة
CREATE TABLE game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_type VARCHAR NOT NULL,
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الاشتراكات
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. تفعيل Row Level Security (RLS)
```sql
-- تفعيل الحماية
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### الخيار الثاني: Firebase (بديل جيد)

#### 1. إنشاء مشروع Firebase
1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com)
2. اضغط "Add project"
3. اتبع الخطوات

#### 2. تفعيل Firestore
1. في لوحة التحكم، اختر "Firestore Database"
2. اضغط "Create database"
3. اختر "Start in test mode"

#### 3. الحصول على إعدادات المشروع
في Project Settings > General > Your apps:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... باقي الإعدادات
};
```

---

## 🚀 الجزء الثالث: نشر المشروع

### الخيار الأول: Vercel (الأسهل)

#### 1. إعداد Git Repository
```bash
# إذا لم تكن قد أنشأت git repository
git init
git add .
git commit -m "Initial commit"

# رفع على GitHub
# أنشئ repository جديد على github.com
git remote add origin https://github.com/username/repository-name.git
git push -u origin main
```

#### 2. النشر على Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بـ GitHub
3. اضغط "New Project"
4. اختر repository الخاص بك
5. اضغط "Deploy"

#### 3. إضافة متغيرات البيئة
في Vercel Dashboard > Settings > Environment Variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

### الخيار الثاني: Netlify

#### 1. بناء المشروع
```bash
npm run build
```

#### 2. النشر
1. اذهب إلى [netlify.com](https://netlify.com)
2. اسحب مجلد `dist` إلى الموقع
3. أو اربط GitHub repository

### الخيار الثالث: GitHub Pages

#### 1. إعداد GitHub Actions
أنشئ ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 2. تفعيل GitHub Pages
1. في repository settings
2. اذهب إلى Pages
3. اختر "Deploy from a branch"
4. اختر "gh-pages"

---

## ⚙️ الجزء الرابع: إدارة النظام بعد النشر

### 1. مراقبة الأداء

#### إضافة Google Analytics
```html
<!-- في index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### مراقبة الأخطاء مع Sentry
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// في main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

### 2. النسخ الاحتياطية

#### نسخ احتياطي لقاعدة البيانات (Supabase)
```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# إنشاء نسخة احتياطية
supabase db dump --project-ref your-project-ref > backup.sql
```

### 3. التحديثات

#### تحديث المكتبات
```bash
# فحص التحديثات المتاحة
npm outdated

# تحديث جميع المكتبات
npm update

# تحديث مكتبة محددة
npm install package-name@latest
```

#### نشر تحديث جديد
```bash
# إضافة التغييرات
git add .
git commit -m "وصف التحديث"
git push

# سيتم النشر تلقائياً إذا كنت تستخدم Vercel/Netlify
```

---

## 🔧 الجزء الخامس: حل المشاكل الشائعة

### 1. مشاكل البناء

#### خطأ "Module not found"
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

#### خطأ في TypeScript
```bash
# فحص الأخطاء
npx tsc --noEmit

# إصلاح تلقائي للتنسيق
npx prettier --write .
```

### 2. مشاكل قاعدة البيانات

#### خطأ في الاتصال
1. تأكد من صحة المفاتيح في `.env`
2. تأكد من تفعيل RLS policies
3. فحص network policies في Supabase

#### بطء في الاستعلامات
```sql
-- إضافة فهارس للجداول
CREATE INDEX idx_game_progress_user_id ON game_progress(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### 3. مشاكل الأداء

#### تحسين حجم البناء
```typescript
// في vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

#### تحسين الصور
```bash
# ضغط الصور
npm install -D vite-plugin-imagemin
```

---

## 📊 الجزء السادس: المراقبة والتحليلات

### 1. إعداد لوحة تحكم

#### Supabase Dashboard
- مراقبة عدد المستخدمين
- تتبع الاستعلامات
- مراقبة استهلاك الموارد

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// في main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 2. تتبع الأحداث المخصصة

```typescript
// تتبع بدء اللعبة
function trackGameStart(gameType: string) {
  gtag('event', 'game_start', {
    game_type: gameType,
    timestamp: new Date().toISOString()
  });
}

// تتبع إكمال المستوى
function trackLevelComplete(level: number, score: number) {
  gtag('event', 'level_complete', {
    level: level,
    score: score
  });
}
```

---

## 🎯 الجزء السابع: خطة الصيانة

### أسبوعياً
- [ ] فحص الأخطاء في Sentry
- [ ] مراجعة إحصائيات الاستخدام
- [ ] فحص أداء قاعدة البيانات

### شهرياً
- [ ] تحديث المكتبات
- [ ] نسخ احتياطي لقاعدة البيانات
- [ ] مراجعة تكاليف الاستضافة
- [ ] تحليل تقارير الأداء

### ربع سنوياً
- [ ] مراجعة أمان النظام
- [ ] تحديث خطة النسخ الاحتياطي
- [ ] تقييم الحاجة لترقية الخطة

---

## 🆘 جهات الاتصال والدعم

### الدعم الفني
- **Supabase**: [support.supabase.com](https://support.supabase.com)
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **React**: [react.dev](https://react.dev)

### المجتمعات
- **Discord Supabase**: [discord.supabase.com](https://discord.supabase.com)
- **Reddit React**: [r/reactjs](https://reddit.com/r/reactjs)
- **Stack Overflow**: للأسئلة التقنية

---

## ✅ قائمة المراجعة النهائية

### قبل النشر
- [ ] اختبار جميع الميزات محلياً
- [ ] فحص الأخطاء في Console
- [ ] اختبار على أجهزة مختلفة
- [ ] تحسين الصور والملفات
- [ ] إعداد متغيرات البيئة

### بعد النشر
- [ ] اختبار الموقع المنشور
- [ ] إعداد المراقبة
- [ ] إنشاء نسخة احتياطية
- [ ] توثيق عملية النشر
- [ ] إعداد تنبيهات الأخطاء

---

## 🎉 تهانينا!

الآن لديك دليل شامل لإدارة ونشر مشروعك. ابدأ بالخطوات الأساسية وتقدم تدريجياً. لا تتردد في الرجوع لهذا الدليل كلما احتجت!

**نصيحة أخيرة**: ابدأ بسيط واتقن الأساسيات قبل الانتقال للميزات المتقدمة. النجاح يأتي خطوة بخطوة! 🚀