# إصلاح مشكلة النشر على Netlify

## المشكلة
ظهور خطأ `Cannot find name 'setResetToken'` أثناء البناء على Netlify رغم أن البناء ينجح محلياً.

## الحلول المطبقة

### 1. تنظيف Cache
- تم حذف `package-lock.json` وإعادة تثبيت التبعيات
- تم إنشاء ملف `.nvmrc` لضمان استخدام Node.js 18

### 2. التحقق من الكود
- تم التأكد من عدم وجود `setResetToken` في الكود
- جميع المراجع تستخدم `setVerificationCode` بشكل صحيح

### 3. إعدادات Netlify
- تم التأكد من صحة `netlify.toml`
- Node.js version مضبوط على 18

## خطوات النشر

1. **تنظيف Cache على Netlify:**
   - اذهب إلى Netlify Dashboard
   - Site Settings > Build & Deploy
   - Clear cache and deploy site

2. **إعادة النشر:**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

3. **إذا استمرت المشكلة:**
   - تحقق من Build logs في Netlify
   - تأكد من أن Node.js version هو 18
   - جرب Manual deploy من مجلد `dist`

## ملاحظات
- البناء ينجح محلياً بدون أخطاء
- المشكلة قد تكون في cache Netlify
- تم تحديث جميع المراجع من `resetToken` إلى `verificationCode`