# 🔑 كيفية الحصول على Public Key من EmailJS

## 📋 خطوات سريعة:

### 1. اذهب إلى لوحة التحكم في EmailJS
- افتح: https://dashboard.emailjs.com/
- سجل دخول بحسابك

### 2. اذهب إلى Account Settings
- في الشريط الجانبي، اختر "Account"
- أو اذهب مباشرة إلى: https://dashboard.emailjs.com/admin/account

### 3. ابحث عن Public Key
- ستجد قسم "API Keys"
- انسخ "Public Key" (يبدأ عادة بـ user_)

### 4. حدث الكود
في ملف `services/EmailService.ts`، استبدل:
```javascript
publicKey: 'temp_public_key', // مؤقت
```

بـ:
```javascript
publicKey: 'user_xxxxxxxxxxxxxxx', // المفتاح الحقيقي
```

## 🧪 اختبار النظام:

### بعد تحديث المفتاح:
1. احفظ الملف
2. أعد تشغيل التطبيق: `npm run dev`
3. اذهب إلى صفحة اختبار البريد
4. اختبر إرسال بريد

### رسائل النجاح المتوقعة:
```
✅ EmailJS service initialized successfully
📧 Using Gmail SMTP through EmailJS: exiq99@gmail.com
```

### إذا رأيت هذه الرسالة:
```
⚠️ Using temporary public key - please update with real EmailJS public key
```
**معناها:** لم يتم تحديث المفتاح بعد

## 🔧 معلومات النظام الحالي:

- **Service ID**: `service_m7qnbim` ✅
- **Template ID**: `template_5ckv8cg` ✅  
- **Gmail Account**: `exiq99@gmail.com` ✅
- **Public Key**: يحتاج تحديث ⚠️

## 📞 إذا واجهت مشاكل:

1. **تأكد من أن الخدمة متصلة بـ Gmail**
2. **تأكد من أن القالب موجود وفعال**
3. **تأكد من أن Public Key صحيح**
4. **راجع وحدة التحكم للأخطاء**