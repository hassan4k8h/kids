-- مثال على إدراج اشتراك جديد في جدول subscriptions
-- هذا الملف يحتوي على أمثلة لاستخدام جدول الاشتراكات

-- ✅ مثال على جملة INSERT لإضافة اشتراك جديد:
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  status,
  plan_type,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
)
VALUES (
  'user-uuid-here', -- استبدل بـ UUID المستخدم الفعلي
  'sub_abc123xyz',  -- معرف الاشتراك من Stripe (اختياري)
  'active',         -- حالة الاشتراك: active, canceled, past_due
  'monthly',        -- نوع الخطة: monthly, yearly
  now(),           -- بداية الفترة الحالية
  now() + interval '30 days', -- نهاية الفترة الحالية
  now(),           -- تاريخ الإنشاء
  now()            -- تاريخ آخر تحديث
);

-- ✅ مثال على اشتراك سنوي:
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  status,
  plan_type,
  current_period_start,
  current_period_end
)
VALUES (
  'another-user-uuid',
  'sub_yearly123',
  'active',
  'yearly',
  now(),
  now() + interval '365 days'
);

-- ✅ مثال على اشتراك بدون Stripe (دفع يدوي):
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id, -- يمكن تركه NULL
  status,
  plan_type,
  current_period_start,
  current_period_end
)
VALUES (
  'manual-payment-user-uuid',
  NULL, -- لا يوجد معرف Stripe
  'active',
  'monthly',
  now(),
  now() + interval '30 days'
);

-- ✅ استعلامات مفيدة للاشتراكات:

-- عرض جميع الاشتراكات النشطة:
SELECT * FROM subscriptions WHERE status = 'active';

-- عرض الاشتراكات المنتهية الصلاحية:
SELECT * FROM subscriptions 
WHERE current_period_end < now() AND status = 'active';

-- تحديث حالة اشتراك:
UPDATE subscriptions 
SET status = 'canceled', updated_at = now()
WHERE user_id = 'user-uuid-here';

-- تجديد اشتراك شهري:
UPDATE subscriptions 
SET 
  current_period_start = now(),
  current_period_end = now() + interval '30 days',
  status = 'active',
  updated_at = now()
WHERE user_id = 'user-uuid-here';

-- ✅ ملاحظات مهمة:
-- 1. التريغر update_subscriptions_updated_at سيحدث updated_at تلقائياً عند أي UPDATE
-- 2. المفتاح الأجنبي fk_user يضمن أن user_id موجود في auth.users
-- 3. ON DELETE CASCADE يعني أنه عند حذف المستخدم، ستحذف اشتراكاته تلقائياً
-- 4. يمكن ترك stripe_subscription_id فارغاً إذا كنت لا تستخدم Stripe