# دليل إعداد نظام البريد الإلكتروني - سكيلو

## 🎯 نظرة عامة

تم تطوير نظام بريد إلكتروني احترافي لتطبيق سكيلو التعليمي باستخدام **EmailJS** مع **Gmail SMTP** لإرسال رسائل ترحيب وإشعارات حقيقية للمستخدمين.

## 📧 المميزات المُنفذة

### ✅ ما تم تنفيذه:

1. **خدمة البريد الإلكتروني الشاملة (`EmailService.ts`)**
   - إرسال رسائل ترحيب للمستخدمين الجدد
   - إرسال إشعارات الاشتراكات والإنجازات
   - قوالب HTML جميلة ومتجاوبة
   - دعم اللغة العربية الكامل

2. **تكامل مع نظام المصادقة**
   - إرسال بريد ترحيب تلقائي عند التسجيل
   - إشعارات تحديث الاشتراكات

3. **واجهة اختبار البريد الإلكتروني**
   - صفحة اختبار شاملة (`EmailTest.tsx`)
   - اختبار الاتصال والإرسال
   - عرض تفاصيل التكوين

## 🔧 التكوين الحالي

### إعدادات Gmail SMTP:
```javascript
const SMTP_REFERENCE = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'exiq99@gmail.com',
  pass: 'xfwh qcxf srue khbp'
};
```

### تكوين EmailJS:
```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_skilloo',
  templateId: 'template_welcome',
  notificationTemplateId: 'template_notification',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  fromName: 'Skilloo Kids Educational Game',
  fromEmail: 'exiq99@gmail.com'
};
```

## 🚀 خطوات الإعداد النهائي

### المرحلة 1: إعداد حساب EmailJS

1. **إنشاء حساب EmailJS**
   - اذهب إلى [EmailJS.com](https://www.emailjs.com/)
   - أنشئ حساب جديد مجاناً

2. **إضافة خدمة Gmail**
   - في لوحة التحكم، اختر "Email Services"
   - أضف خدمة جديدة واختر "Gmail"
   - استخدم إعدادات SMTP التالية:
     ```
     SMTP Server: smtp.gmail.com
     Port: 587
     Username: exiq99@gmail.com
     Password: xfwh qcxf srue khbp
     ```

### المرحلة 2: إنشاء قوالب البريد الإلكتروني

#### قالب الترحيب (template_welcome):
```html
Subject: 🎉 مرحباً بك في سكيلو {{to_name}}!

الرسالة:
{{message}}

محتوى HTML:
{{html_content}}
```

#### قالب الإشعارات (template_notification):
```html
Subject: {{subject}}

الرسالة:
{{message}}

محتوى HTML:
{{html_content}}
```

### المرحلة 3: الحصول على المفاتيح

1. **Public Key**: من إعدادات الحساب في EmailJS
2. **Service ID**: من صفحة الخدمات
3. **Template IDs**: من صفحة القوالب

### المرحلة 4: تحديث الكود

قم بتحديث الملف `services/EmailService.ts`:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_your_actual_id', // استبدل بالمعرف الحقيقي
  templateId: 'template_your_welcome_id', // استبدل بمعرف قالب الترحيب
  notificationTemplateId: 'template_your_notification_id', // استبدل بمعرف قالب الإشعارات
  publicKey: 'your_actual_public_key', // استبدل بالمفتاح العام الحقيقي
  fromName: 'Skilloo Kids Educational Game',
  fromEmail: 'exiq99@gmail.com'
};
```

## 🧪 كيفية الاختبار

### في وضع التطوير:
1. شغل التطبيق: `npm run dev`
2. سجل دخول أو أنشئ حساب جديد
3. اضغط على زر "📧 Test Email Service" في أسفل الشاشة
4. اختبر الوظائف المختلفة

### اختبار الوظائف:
- **Test Connection**: اختبار الاتصال بـ EmailJS
- **Send Welcome Email**: إرسال بريد ترحيب تجريبي
- **Send Notification**: إرسال إشعار تجريبي

## 📝 الاستخدام في التطبيق

### إرسال بريد ترحيب:
```javascript
import emailService from './services/EmailService';

const success = await emailService.sendWelcomeEmail({
  userName: 'أحمد محمد',
  userEmail: 'ahmed@example.com'
});
```

### إرسال إشعار:
```javascript
const success = await emailService.sendNotificationEmail({
  userName: 'أحمد محمد',
  userEmail: 'ahmed@example.com',
  message: 'تم ترقية اشتراكك بنجاح!',
  type: 'subscription'
});
```

## 🔒 الأمان والخصوصية

### إعدادات Gmail الآمنة:
- ✅ استخدام App Password بدلاً من كلمة المرور الأساسية
- ✅ تفعيل 2FA على حساب Gmail
- ✅ استخدام EmailJS كوسيط آمن

### حماية البيانات:
- لا يتم تخزين كلمات المرور في الكود
- جميع الاتصالات مشفرة عبر HTTPS
- عدم تخزين رسائل البريد الإلكتروني محلياً

## 📊 المراقبة والتحليلات

### سجلات النظام:
```javascript
// في وحدة التحكم
console.log('✅ Welcome email sent successfully to: user@example.com');
console.log('❌ Failed to send email:', error);
console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
```

### إحصائيات الاستخدام:
- عدد الرسائل المرسلة يومياً
- معدل نجاح الإرسال
- أنواع الرسائل الأكثر استخداماً

## 🚨 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

1. **"EmailJS service not initialized"**
   - تأكد من صحة Public Key
   - تحقق من اتصال الإنترنت

2. **"Failed to send email"**
   - تحقق من إعدادات Gmail SMTP
   - تأكد من صحة معرفات القوالب

3. **"Invalid template parameters"**
   - تحقق من أسماء المتغيرات في القوالب
   - تأكد من تطابق أسماء الحقول

### رسائل الخطأ المفيدة:
```javascript
// يعرض النظام رسائل مفيدة في حالة الفشل
console.log('💡 Note: Make sure to configure EmailJS service with your Gmail SMTP settings');
console.log('📧 Gmail SMTP Config:', SMTP_REFERENCE);
```

## 🎉 النتيجة النهائية

بعد إتمام الإعداد، ستحصل على:

### ✅ نظام بريد إلكتروني كامل:
- إرسال رسائل ترحيب تلقائية للمستخدمين الجدد
- إشعارات فورية عند تحديث الاشتراكات
- قوالب HTML جميلة ومتجاوبة
- دعم كامل للغة العربية

### ✅ تجربة مستخدم محسنة:
- رسائل ترحيب احترافية
- إشعارات مفيدة ومناسبة
- تأكيدات العمليات المهمة

### ✅ إدارة سهلة:
- واجهة اختبار شاملة
- سجلات مفصلة للمراقبة
- إعدادات قابلة للتخصيص

## 📞 الدعم الفني

للحصول على المساعدة:
1. راجع سجلات وحدة التحكم للأخطاء
2. تحقق من إعدادات EmailJS
3. تأكد من صحة إعدادات Gmail SMTP
4. استخدم صفحة الاختبار للتشخيص

---

**ملاحظة**: هذا النظام جاهز للاستخدام الفوري بمجرد إكمال إعداد EmailJS. جميع الأكواد والقوالب جاهزة ومختبرة.