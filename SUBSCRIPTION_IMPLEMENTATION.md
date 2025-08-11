# دليل تنفيذ نظام الاشتراكات 📋

## ✅ ما تم إنجازه:

### 1. قاعدة البيانات:
- ✅ جدول `subscriptions` مع جميع الحقول المطلوبة
- ✅ المفتاح الأجنبي `fk_user` مع `ON DELETE CASCADE`
- ✅ التريغر `update_subscriptions_updated_at` لتحديث `updated_at` تلقائياً
- ✅ فهارس لتحسين الأداء
- ✅ سياسات الأمان (RLS)
- ✅ أمثلة على جمل INSERT في `database/subscription_examples.sql`

### 2. الملفات الموجودة:
- `database/setup.sql` - إعداد قاعدة البيانات الكامل
- `database/subscription_examples.sql` - أمثلة على استخدام جدول الاشتراكات
- `services/SubscriptionService.ts` - خدمة إدارة الاشتراكات
- `types/Subscription.ts` - أنواع البيانات للاشتراكات

## 🚀 الخطوات التالية المقترحة:

### الخيار الأول: بدون Stripe (دفع يدوي)

#### 1. إنشاء صفحة الاشتراكات:
```bash
# إنشاء صفحة /subscribe
src/pages/Subscribe.tsx
src/components/SubscriptionPlans.tsx
```

#### 2. إنشاء لوحة الإدارة:
```bash
# إنشاء صفحة /admin/subscriptions
src/pages/admin/Subscriptions.tsx
src/components/admin/SubscriptionManager.tsx
```

#### 3. المكونات المطلوبة:
- عرض خطط الاشتراك (شهري/سنوي)
- نموذج طلب الاشتراك
- عرض معلومات الدفع (PayPal/USDT/تحويل بنكي)
- لوحة إدارة لتفعيل/إلغاء الاشتراكات

### الخيار الثاني: مع Stripe (دفع آلي)

#### 1. إعداد Stripe:
```bash
npm install @stripe/stripe-js stripe
```

#### 2. متغيرات البيئة:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. إنشاء API endpoints:
```bash
src/pages/api/stripe/create-checkout-session.ts
src/pages/api/stripe/webhook.ts
src/pages/api/stripe/manage-subscription.ts
```

## 📝 خطة التنفيذ المقترحة:

### المرحلة الأولى: الواجهات الأساسية
1. صفحة عرض خطط الاشتراك
2. نموذج طلب الاشتراك
3. صفحة تأكيد الطلب

### المرحلة الثانية: لوحة الإدارة
1. عرض جميع الاشتراكات
2. تفعيل/إلغاء الاشتراكات
3. إضافة اشتراك جديد يدوياً
4. تجديد الاشتراكات

### المرحلة الثالثة: التكامل مع اللعبة
1. فحص حالة الاشتراك قبل الوصول للمحتوى المدفوع
2. عرض رسائل للمستخدمين غير المشتركين
3. إضافة مؤشر حالة الاشتراك في الواجهة

## 🛠️ الأدوات والمكتبات المقترحة:

### للواجهات:
- React Hook Form - لنماذج الاشتراك
- React Query - لإدارة حالة البيانات
- Tailwind CSS - للتصميم

### للدفع:
- Stripe (إذا كنت تريد دفع آلي)
- PayPal SDK (للدفع عبر PayPal)

### للإدارة:
- React Table - لعرض جداول الاشتراكات
- Date-fns - لمعالجة التواريخ

## 📋 قائمة المهام:

- [ ] إنشاء صفحة `/subscribe`
- [ ] إنشاء مكون `SubscriptionPlans`
- [ ] إنشاء صفحة `/admin/subscriptions`
- [ ] إنشاء مكون `SubscriptionManager`
- [ ] إضافة فحص الاشتراك في اللعبة
- [ ] إنشاء API endpoints للاشتراكات
- [ ] إضافة إشعارات انتهاء الاشتراك
- [ ] إنشاء نظام تجديد تلقائي (اختياري)

## 💡 نصائح مهمة:

1. **الأمان**: تأكد من فحص صحة الاشتراك في الخادم وليس فقط في المتصفح
2. **التجربة المجانية**: فكر في إضافة فترة تجربة مجانية
3. **الإشعارات**: أضف إشعارات قبل انتهاء الاشتراك
4. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من بيانات الاشتراكات
5. **السجلات**: سجل جميع العمليات المالية للمراجعة

## 🔗 روابط مفيدة:

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PayPal Developer](https://developer.paypal.com/)
- [React Hook Form](https://react-hook-form.com/)

---

**ملاحظة**: هذا الدليل يفترض أنك تستخدم Next.js مع Supabase. قم بتعديل المسارات والأدوات حسب إعداد مشروعك.