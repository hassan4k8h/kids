# دليل تنفيذ نظام الاشتراكات والميزات المتقدمة

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية تطوير نظام اشتراكات احترافي للعبة التعليمية للأطفال باستخدام React وتقنيات حديثة.

## 🛠️ المكدس التقني المقترح

| المكون | الأداة المقترحة | السبب |
|--------|-----------------|-------|
| **الواجهة الأمامية** | React + TypeScript + Tailwind CSS | سرعة التطوير وقابلية الصيانة |
| **إدارة الحالة** | Redux Toolkit + RTK Query | إدارة حالة متقدمة مع تخزين مؤقت |
| **نظام الاشتراكات** | Stripe + Webhooks | موثوق وآمن ومدعوم عالمياً |
| **قاعدة البيانات** | Supabase أو Firebase | قاعدة بيانات في الوقت الفعلي |
| **الخادم الخلفي** | Next.js API Routes | تكامل سلس مع React |
| **المصادقة** | NextAuth.js أو Supabase Auth | آمن ومرن |
| **الإشعارات** | Firebase Cloud Messaging | إشعارات فورية |
| **التحليلات** | Google Analytics + Mixpanel | تتبع سلوك المستخدمين |

## 📋 خطة التنفيذ

### المرحلة 1: إعداد البنية الأساسية

#### 1.1 تحديث package.json
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.1.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "@supabase/supabase-js": "^2.38.0",
    "next-auth": "^4.24.0",
    "stripe": "^14.0.0",
    "firebase": "^10.5.0"
  }
}
```

#### 1.2 إعداد متغيرات البيئة
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### المرحلة 2: تصميم قاعدة البيانات

#### 2.1 جداول قاعدة البيانات (Supabase)
```sql
-- جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الاشتراكات
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR UNIQUE,
  status VARCHAR NOT NULL, -- active, canceled, past_due
  plan_type VARCHAR NOT NULL, -- monthly, yearly
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول تقدم اللعبة
CREATE TABLE game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR NOT NULL, -- alphabet, math, colors, etc.
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  lives INTEGER DEFAULT 3,
  unlocked_content JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  last_played TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الإحصائيات
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_playtime INTEGER DEFAULT 0, -- بالدقائق
  games_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  streak_record INTEGER DEFAULT 0,
  favorite_game VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### المرحلة 3: تنفيذ نظام الاشتراكات

#### 3.1 إعداد Stripe Products
```javascript
// scripts/setup-stripe-products.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  // إنشاء المنتج
  const product = await stripe.products.create({
    name: 'لعبة تعليمية للأطفال - اشتراك مميز',
    description: 'وصول كامل لجميع الألعاب والمحتوى التعليمي',
  });

  // إنشاء خطة شهرية
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 500, // $5.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
  });

  // إنشاء خطة سنوية
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 5000, // $50.00
    currency: 'usd',
    recurring: {
      interval: 'year',
    },
  });

  console.log('Monthly Price ID:', monthlyPrice.id);
  console.log('Yearly Price ID:', yearlyPrice.id);
}

createProducts();
```

#### 3.2 صفحة الاشتراكات
```tsx
// components/subscription/SubscriptionPage.tsx
import React from 'react';
import { useUser } from '@/hooks/useUser';
import { SubscriptionCard } from './SubscriptionCard';
import { CurrentPlan } from './CurrentPlan';

const plans = [
  {
    id: 'monthly',
    name: 'الاشتراك الشهري',
    price: '$5',
    period: 'شهرياً',
    priceId: 'price_monthly_id',
    features: [
      'وصول لجميع الألعاب',
      'تتبع التقدم',
      'شهادات إنجاز',
      'دعم فني'
    ]
  },
  {
    id: 'yearly',
    name: 'الاشتراك السنوي',
    price: '$50',
    period: 'سنوياً',
    priceId: 'price_yearly_id',
    popular: true,
    features: [
      'جميع ميزات الاشتراك الشهري',
      'خصم 17%',
      'محتوى حصري',
      'أولوية في الدعم'
    ]
  }
];

export function SubscriptionPage() {
  const { user, subscription } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            اختر خطة الاشتراك المناسبة
          </h1>
          <p className="text-xl text-gray-600">
            استمتع بتجربة تعليمية شاملة لطفلك
          </p>
        </div>

        {subscription?.status === 'active' && (
          <CurrentPlan subscription={subscription} />
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              currentPlan={subscription?.plan_type}
              isActive={subscription?.status === 'active'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 3.3 مكون بطاقة الاشتراك
```tsx
// components/subscription/SubscriptionCard.tsx
import React, { useState } from 'react';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { createCheckoutSession } from '@/lib/stripe';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  priceId: string;
  popular?: boolean;
  features: string[];
}

interface Props {
  plan: Plan;
  currentPlan?: string;
  isActive: boolean;
}

export function SubscriptionCard({ plan, currentPlan, isActive }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(plan.priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = currentPlan === plan.id;
  const buttonText = isCurrentPlan ? 'الخطة الحالية' : 'اشترك الآن';
  const buttonDisabled = isCurrentPlan || loading;

  return (
    <div className={`relative bg-white rounded-2xl shadow-xl p-8 ${
      plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
    }`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <StarIcon className="w-4 h-4 mr-1" />
            الأكثر شعبية
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-bold text-gray-900">
            {plan.price}
          </span>
          <span className="text-xl text-gray-500 mr-2">
            {plan.period}
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 ml-3" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={buttonDisabled}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
          plan.popular
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'جاري التحميل...' : buttonText}
      </button>
    </div>
  );
}
```

### المرحلة 4: API Routes

#### 4.1 إنشاء جلسة الدفع
```typescript
// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { priceId } = req.body;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    });

    res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
```

#### 4.2 Webhook للتعامل مع أحداث Stripe
```typescript
// pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await supabase
    .from('subscriptions')
    .insert({
      user_id: session.metadata?.userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan_type: subscription.items.data[0].price.recurring?.interval,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

### المرحلة 5: إدارة الحالة مع Redux

#### 5.1 إعداد Store
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { subscriptionApi } from './api/subscriptionApi';
import { gameApi } from './api/gameApi';
import authSlice from './slices/authSlice';
import gameSlice from './slices/gameSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    game: gameSlice,
    [authApi.reducerPath]: authApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(gameApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 5.2 API للاشتراكات
```typescript
// store/api/subscriptionApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_end: string;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/subscription',
  }),
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    getSubscription: builder.query<Subscription | null, void>({
      query: () => '/current',
      providesTags: ['Subscription'],
    }),
    
    createCheckoutSession: builder.mutation<{ url: string }, string>({
      query: (priceId) => ({
        url: '/create-checkout-session',
        method: 'POST',
        body: { priceId },
      }),
    }),
    
    cancelSubscription: builder.mutation<void, void>({
      query: () => ({
        url: '/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
```

### المرحلة 6: حماية المحتوى

#### 6.1 مكون حماية المحتوى
```tsx
// components/auth/SubscriptionGuard.tsx
import React from 'react';
import { useGetSubscriptionQuery } from '@/store/api/subscriptionApi';
import { SubscriptionPrompt } from './SubscriptionPrompt';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Props {
  children: React.ReactNode;
  requiredPlan?: 'monthly' | 'yearly';
  fallback?: React.ReactNode;
}

export function SubscriptionGuard({ children, requiredPlan, fallback }: Props) {
  const { data: subscription, isLoading } = useGetSubscriptionQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const hasActiveSubscription = subscription?.status === 'active';
  const hasRequiredPlan = !requiredPlan || subscription?.plan_type === requiredPlan;

  if (!hasActiveSubscription || !hasRequiredPlan) {
    return fallback || <SubscriptionPrompt requiredPlan={requiredPlan} />;
  }

  return <>{children}</>;
}
```

#### 6.2 استخدام الحماية في الألعاب
```tsx
// components/games/AlphabetGameWrapper.tsx
import React from 'react';
import { SubscriptionGuard } from '../auth/SubscriptionGuard';
import { AlphabetGame } from './AlphabetGame';

interface Props {
  level: number;
  // ... other props
}

export function AlphabetGameWrapper({ level, ...props }: Props) {
  // المستويات 1-10 مجانية، الباقي يتطلب اشتراك
  const requiresSubscription = level > 10;

  if (!requiresSubscription) {
    return <AlphabetGame level={level} {...props} />;
  }

  return (
    <SubscriptionGuard>
      <AlphabetGame level={level} {...props} />
    </SubscriptionGuard>
  );
}
```

### المرحلة 7: الإشعارات والتحديثات

#### 7.1 إعداد Firebase Cloud Messaging
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // your config
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    
    if (token) {
      // إرسال التوكن للخادم لحفظه
      await fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
}

export function setupNotificationListener() {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // عرض الإشعار في التطبيق
  });
}
```

#### 7.2 نظام التحديثات التلقائية
```typescript
// hooks/useAppUpdates.ts
import { useEffect, useState } from 'react';

interface AppVersion {
  version: string;
  releaseDate: string;
  features: string[];
  critical: boolean;
}

export function useAppUpdates() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);

  useEffect(() => {
    checkForUpdates();
    
    // فحص التحديثات كل 30 دقيقة
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/app/version');
      const data = await response.json();
      
      const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
      
      if (data.version !== currentVersion) {
        setLatestVersion(data);
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  return {
    updateAvailable,
    latestVersion,
    checkForUpdates,
  };
}
```

## 🚀 نصائح للتطوير

### الأمان
- استخدم HTTPS في الإنتاج
- تحقق من صحة جميع المدخلات
- استخدم متغيرات البيئة للمفاتيح السرية
- فعل CSP (Content Security Policy)

### الأداء
- استخدم React.memo للمكونات الثقيلة
- طبق lazy loading للصفحات
- ضغط الصور والأصول
- استخدم CDN للملفات الثابتة

### تجربة المستخدم
- اختبر على أجهزة مختلفة
- طبق مبادئ الوصولية (a11y)
- استخدم loading states
- اعرض رسائل خطأ واضحة

### المراقبة والتحليلات
- راقب الأخطاء باستخدام Sentry
- تتبع الأداء مع Web Vitals
- حلل سلوك المستخدمين
- راقب معدلات التحويل

## 📊 مؤشرات الأداء الرئيسية (KPIs)

- **معدل التحويل**: نسبة المستخدمين الذين يشتركون
- **معدل الاحتفاظ**: نسبة المشتركين الذين يجددون
- **متوسط الإيرادات لكل مستخدم (ARPU)**
- **معدل الإلغاء (Churn Rate)**
- **مدة الجلسة ومعدل المشاركة**

## 🎯 الخطوات التالية

1. **تطوير MVP**: ابدأ بالميزات الأساسية
2. **اختبار المستخدمين**: احصل على تغذية راجعة
3. **تحسين التحويل**: حسن صفحات الاشتراك
4. **إضافة ميزات متقدمة**: تقارير الوالدين، ألعاب جديدة
5. **التوسع**: دعم لغات أخرى، منصات جديدة

هذا الدليل يوفر أساساً قوياً لبناء نظام اشتراكات احترافي. يمكن تخصيصه وتوسيعه حسب احتياجات مشروعك المحددة.