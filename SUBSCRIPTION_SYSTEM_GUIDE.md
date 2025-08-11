# دليل نظام الاشتراكات الكامل 🚀

## 📋 نظرة عامة

تم تنفيذ نظام اشتراكات كامل للعبة التعليمية يتضمن:
- ✅ قاعدة بيانات محدثة مع جدول `subscriptions`
- ✅ مكونات React للواجهات
- ✅ خدمات إدارة الاشتراكات
- ✅ حماية المحتوى المدفوع
- ✅ لوحة إدارة للمسؤولين

## 🗄️ قاعدة البيانات

### الجدول الجديد:
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  plan_type TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### التريغر التلقائي:
```sql
CREATE TRIGGER update_subscription_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 📁 الملفات المنشأة

### 1. المكونات (Components)
- `components/subscription/ProtectedPage.tsx` - صفحة محمية
- `components/subscription/AdminSubscriptions.tsx` - لوحة إدارة
- `components/subscription/SubscriptionPage.tsx` - صفحة الاشتراك
- `components/subscription/SubscriptionGuard.tsx` - حماية المحتوى

### 2. الخدمات (Services)
- `services/ManualSubscriptionService.ts` - إدارة الاشتراكات

### 3. الـ Hooks
- `hooks/useSubscription.ts` - hook للتحقق من الاشتراك

### 4. الأمثلة
- `examples/SubscriptionUsageExample.tsx` - أمثلة شاملة
- `database/subscription_examples.sql` - أمثلة SQL

## 🚀 كيفية الاستخدام

### 1. حماية صفحة كاملة:
```tsx
import SubscriptionGuard from './components/subscription/SubscriptionGuard'

function PremiumPage() {
  return (
    <SubscriptionGuard>
      <div>محتوى حصري للمشتركين</div>
    </SubscriptionGuard>
  )
}
```

### 2. حماية جزء من المحتوى:
```tsx
import { SubscriptionCheck } from './components/subscription/SubscriptionGuard'

function GameCard({ isPremium }) {
  if (isPremium) {
    return (
      <SubscriptionCheck message="لعبة حصرية">
        <div>محتوى اللعبة المدفوعة</div>
      </SubscriptionCheck>
    )
  }
  return <div>محتوى مجاني</div>
}
```

### 3. التحقق من حالة الاشتراك:
```tsx
import { useSubscription } from './hooks/useSubscription'

function MyComponent() {
  const { isSubscribed, subscription, loading } = useSubscription()
  
  if (loading) return <div>جارٍ التحميل...</div>
  
  return (
    <div>
      {isSubscribed ? (
        <p>مرحباً أيها المشترك! خطتك: {subscription?.plan_type}</p>
      ) : (
        <p>اشترك للحصول على المزيد من المميزات</p>
      )}
    </div>
  )
}
```

### 4. إنشاء اشتراك يدوي:
```tsx
import { createManualSubscription } from './services/ManualSubscriptionService'

const handleSubscribe = async () => {
  const user = await supabase.auth.getUser()
  const result = await createManualSubscription(user.data.user.id, 'monthly')
  
  if (!result.error) {
    alert('تم تفعيل الاشتراك!')
  }
}
```

## 🎯 التكامل مع التطبيق الحالي

### 1. إضافة التوجيه (Routing):
```tsx
// في App.tsx أو الملف الرئيسي
import { Routes, Route } from 'react-router-dom'
import SubscriptionPage from './components/subscription/SubscriptionPage'
import AdminSubscriptions from './components/subscription/AdminSubscriptions'

<Routes>
  <Route path="/subscribe" element={<SubscriptionPage />} />
  <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
  {/* باقي المسارات */}
</Routes>
```

### 2. إضافة حالة الاشتراك للقائمة:
```tsx
// في MainMenu.tsx أو الشريط العلوي
import { SubscriptionStatus } from './components/subscription/SubscriptionGuard'

<nav>
  <div>شعار التطبيق</div>
  <SubscriptionStatus />
</nav>
```

### 3. حماية الألعاب المتقدمة:
```tsx
// في GameScreen.tsx
import SubscriptionGuard from './components/subscription/SubscriptionGuard'

function AdvancedGame() {
  return (
    <SubscriptionGuard>
      <GameEngine gameType="advanced" />
    </SubscriptionGuard>
  )
}
```

## 🔧 إعداد قاعدة البيانات

### 1. تطبيق التحديثات:
```bash
# في Supabase SQL Editor
# نسخ ولصق محتوى database/setup.sql
```

### 2. إدراج اشتراك تجريبي:
```sql
INSERT INTO subscriptions (
  user_id,
  plan_type,
  current_period_end
) VALUES (
  'user-uuid-here',
  'monthly',
  now() + interval '30 days'
);
```

## 🎨 تخصيص الواجهات

### تغيير رسائل الترقية:
```tsx
<SubscriptionGuard 
  fallback={
    <div>رسالة مخصصة للترقية</div>
  }
>
  {/* المحتوى المحمي */}
</SubscriptionGuard>
```

### تخصيص صفحة الاشتراك:
```tsx
// تعديل SubscriptionPage.tsx
const plans = {
  monthly: {
    name: 'الخطة الشهرية',
    price: '$10', // تغيير السعر
    // باقي الخصائص
  }
}
```

## 🔐 الأمان والحماية

### 1. التحقق من الخادم:
```tsx
// دائماً تحقق من الاشتراك في الخادم أيضاً
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .gte('current_period_end', new Date().toISOString())
  .single()
```

### 2. سياسات RLS:
```sql
-- تم تطبيقها تلقائياً في setup.sql
CREATE POLICY "Users can view own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);
```

## 📊 لوحة الإدارة

### الوصول:
```
/admin/subscriptions
```

### المميزات:
- عرض جميع الاشتراكات
- تفعيل/إلغاء الاشتراكات
- تجديد الاشتراكات
- فلترة حسب الحالة

## 🔄 التحديثات المستقبلية

### إضافة Stripe:
1. تثبيت مكتبات Stripe
2. إنشاء API endpoints
3. تحديث SubscriptionPage
4. إضافة webhooks

### إضافة إشعارات:
1. تحديد الاشتراكات المنتهية
2. إرسال تذكيرات
3. إشعارات في التطبيق

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في قاعدة البيانات:**
   - تأكد من تطبيق setup.sql
   - تحقق من صلاحيات RLS

2. **عدم ظهور حالة الاشتراك:**
   - تحقق من تسجيل الدخول
   - راجع console للأخطاء

3. **مشاكل التوجيه:**
   - تأكد من إعداد React Router
   - تحقق من المسارات

## 📞 الدعم

للمساعدة أو الاستفسارات:
- راجع الأمثلة في `examples/SubscriptionUsageExample.tsx`
- تحقق من console المتصفح للأخطاء
- راجع Supabase logs

---

**ملاحظة:** هذا النظام جاهز للاستخدام ويمكن توسيعه حسب احتياجاتك المستقبلية.