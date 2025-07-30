# إعداد خدمة البريد الإلكتروني - Email Service Setup

## نظرة عامة - Overview

تم تنفيذ نظام إرسال البريد الإلكتروني باستخدام خدمة Resend لإرسال رسائل التفعيل والترحيب للمستخدمين الجدد.

An email service system has been implemented using Resend to send activation and welcome emails to new users.

## الميزات المنفذة - Implemented Features

### 1. رسائل الترحيب - Welcome Emails
- يتم إرسالها تلقائياً عند تسجيل مستخدم جديد
- تحتوي على رسالة ترحيب شخصية
- Automatically sent when a new user registers
- Contains a personalized welcome message

### 2. رسائل تفعيل الاشتراك - Subscription Activation Emails
- يتم إرسالها عند ترقية الاشتراك إلى باقة مدفوعة
- تؤكد تفعيل الاشتراك بنجاح
- Sent when upgrading to a paid subscription plan
- Confirms successful subscription activation

### 3. تذكيرات انتهاء الاشتراك - Subscription Expiry Reminders
- يتم إرسالها قبل 3 أيام من انتهاء الاشتراك
- تذكر المستخدم بضرورة تجديد الاشتراك
- Sent 3 days before subscription expires
- Reminds users to renew their subscription

## إعداد خدمة Resend - Resend Service Setup

### 1. إنشاء حساب - Create Account
1. اذهب إلى [https://resend.com](https://resend.com)
2. أنشئ حساب جديد
3. Go to [https://resend.com](https://resend.com)
4. Create a new account

### 2. الحصول على API Key
1. اذهب إلى Dashboard
2. انقر على "API Keys"
3. أنشئ مفتاح API جديد
4. انسخ المفتاح

### 3. إعداد متغيرات البيئة - Environment Variables

أضف المتغيرات التالية إلى ملف `.env.local`:

```env
# Resend API Key for Email Service
VITE_RESEND_API_KEY=your_resend_api_key_here

# Email Configuration
VITE_FROM_EMAIL=Your App <noreply@yourapp.com>
```

## الملفات المحدثة - Updated Files

### 1. `services/EmailService.ts`
- خدمة إرسال البريد الإلكتروني الرئيسية
- تحتوي على دوال إرسال جميع أنواع الرسائل
- Main email service
- Contains functions for sending all types of emails

### 2. `services/SubscriptionService.ts`
- تم إضافة إرسال رسائل التفعيل والتذكير
- يتم فحص انتهاء الاشتراكات كل ساعة
- Added activation and reminder email sending
- Checks subscription expiry every hour

### 3. `services/AuthService.ts`
- تم إضافة إرسال رسائل الترحيب للمستخدمين الجدد
- Added welcome email sending for new users

### 4. `components/subscription/SubscriptionScreen.tsx`
- تم تحديث عملية إتمام الاشتراك لتشمل إرسال البريد الإلكتروني
- Updated subscription completion to include email sending

## كيفية الاستخدام - How to Use

### 1. تسجيل مستخدم جديد - New User Registration
```typescript
// يتم إرسال رسالة ترحيب تلقائياً
// Welcome email is sent automatically
const result = await AuthService.signup(userData);
```

### 2. ترقية الاشتراك - Subscription Upgrade
```typescript
// يتم إرسال رسالة تفعيل تلقائياً
// Activation email is sent automatically
const success = await SubscriptionService.upgradePlan(
  userId, 
  planId, 
  userEmail, 
  userName
);
```

### 3. إرسال رسالة مخصصة - Send Custom Email
```typescript
import { EmailService } from './services/EmailService';

// إرسال رسالة مخصصة
const result = await EmailService.sendEmail(
  'user@example.com',
  'عنوان الرسالة',
  '<h1>محتوى الرسالة</h1>'
);
```

## الحدود والقيود - Limits and Restrictions

### خطة Resend المجانية - Free Resend Plan
- 100 رسالة يومياً
- 3000 رسالة شهرياً
- 100 emails per day
- 3000 emails per month

## استكشاف الأخطاء - Troubleshooting

### 1. فشل إرسال البريد الإلكتروني - Email Sending Failure
- تأكد من صحة API Key
- تحقق من متغيرات البيئة
- راجع حدود الاستخدام في Resend

### 2. عدم وصول الرسائل - Emails Not Received
- تحقق من مجلد الرسائل غير المرغوب فيها
- تأكد من صحة عنوان البريد الإلكتروني
- راجع سجلات Resend Dashboard

## الأمان - Security

- لا تشارك API Key مع أحد
- استخدم متغيرات البيئة فقط
- لا تضع المفاتيح في الكود مباشرة
- Never share your API Key
- Use environment variables only
- Don't put keys directly in code

## الدعم - Support

للمساعدة أو الاستفسارات:
- راجع [وثائق Resend](https://resend.com/docs)
- تحقق من سجلات التطبيق
- راجع ملف README الرئيسي

For help or questions:
- Check [Resend Documentation](https://resend.com/docs)
- Review application logs
- Check main README file