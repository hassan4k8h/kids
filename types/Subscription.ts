export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly' | 'free';
  durationMonths: number;
  features: string[];
  featuresAr: string[];
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  limits?: SubscriptionLimits;
}

export interface SubscriptionLimits {
  maxGamesPerDay: number;
  maxStoriesPerWeek: number;
  maxLevel: number; // أقصى مستوى يمكن الوصول إليه
  maxPlayers: number;
  features: {
    unlimitedStories: boolean;
    premiumHeroes: boolean;
    customStories: boolean;
    allGames: boolean;
    advancedLevels: boolean;
    multiplayerMode: boolean;
    unlimitedPlayers: boolean;
    offlineMode: boolean;
    progressSync: boolean;
    parentalReports: boolean;
    adFree: boolean;
    prioritySupport: boolean;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  displayName: string;
  displayNameAr: string;
  icon: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  currentSubscription: Subscription | null;
  activePlan: SubscriptionPlan | null;
  daysRemaining: number;
  trialUsed: boolean;
  paymentMethods: PaymentMethod[];
  usage: UsageStats;
}

export interface UsageStats {
  gamesPlayedToday: number;
  storiesReadThisWeek: number;
  currentMaxLevel: number;
  totalPlayersCreated: number;
  lastResetDate: string;
  featuresUsed: string[];
  lastGamePlayed: string | null;
  lastStoryRead: string | null;
  streakDays: number; // سلسلة الأيام المتتالية
  lastActiveDate?: string; // آخر يوم نشاط بصيغة ISO
  weeklyStats: {
    gamesPlayed: number;
    storiesRead: number;
    timeSpent: number;
    achievementsUnlocked: number;
  };
  monthlyStats: {
    gamesPlayed: number;
    storiesRead: number;
    timeSpent: number;
    achievementsUnlocked: number;
  };
  lastReset?: string;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  country: string;
  city: string;
  postalCode: string;
  address: string;
  phone?: string;
  taxId?: string;
}

export interface SubscriptionFeatures {
  // محتوى القصص
  unlimitedStories: boolean;
  premiumHeroes: boolean;
  customStories: boolean;
  
  // الألعاب
  allGames: boolean;
  advancedLevels: boolean;
  multiplayerMode: boolean;
  
  // المميزات الأخرى
  unlimitedPlayers: boolean;
  offlineMode: boolean;
  progressSync: boolean;
  parentalReports: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

// الباقات المتاحة مع الباقة المجانية
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    nameAr: 'الباقة المجانية',
    description: 'Limited access to basic features',
    descriptionAr: 'وصول محدود للمميزات الأساسية',
    price: 0,
    currency: 'USD',
    duration: 'free',
    durationMonths: 0,
    features: [
      '3 Games per Day',
      '1 Story per Week',
      'Up to 2 Children Profiles',
      'Basic Level Access (1-5)',
      'Limited Heroes',
      'With Ads'
    ],
    featuresAr: [
      '3 ألعاب يومياً',
      'قصة واحدة أسبوعياً',
      'حتى ملفين للأطفال',
      'وصول محدود للمستويات (1-5)',
      'أبطال محدودون',
      'مع إعلانات'
    ],
    limits: {
      maxGamesPerDay: 3,
      maxStoriesPerWeek: 1,
      maxLevel: 5,
      maxPlayers: 2,
      features: {
        unlimitedStories: false,
        premiumHeroes: false,
        customStories: false,
        allGames: false,
        advancedLevels: false,
        multiplayerMode: false,
        unlimitedPlayers: false,
        offlineMode: false,
        progressSync: false,
        parentalReports: false,
        adFree: false,
        prioritySupport: false
      }
    }
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    nameAr: 'الباقة الشهرية',
    description: 'Full access to all features for one month',
    descriptionAr: 'وصول كامل لجميع المميزات لمدة شهر واحد',
    price: 3,
    currency: 'USD',
    duration: 'monthly',
    durationMonths: 1,
    features: [
      'Unlimited Stories & Games',
      'All Heroes & Characters',
      'Unlimited Children Profiles',
      'All Levels (1-100+)',
      'Offline Mode',
      'Progress Tracking',
      'Ad-Free Experience',
      'Priority Support'
    ],
    featuresAr: [
      'قصص وألعاب غير محدودة',
      'جميع الأبطال والشخصيات',
      'ملفات أطفال غير محدودة',
      'جميع المستويات (1-100+)',
      'وضع عدم الاتصال',
      'تتبع التقدم',
      'تجربة خالية من الإعلانات',
      'دعم أولوية'
    ],
    limits: {
      maxGamesPerDay: -1, // غير محدود
      maxStoriesPerWeek: -1, // غير محدود
      maxLevel: -1, // غير محدود
      maxPlayers: -1, // غير محدود
      features: {
        unlimitedStories: true,
        premiumHeroes: true,
        customStories: true,
        allGames: true,
        advancedLevels: true,
        multiplayerMode: true,
        unlimitedPlayers: true,
        offlineMode: true,
        progressSync: true,
        parentalReports: true,
        adFree: true,
        prioritySupport: true
      }
    }
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    nameAr: 'الباقة السنوية',  
    description: 'Full access to all features for one year with 17% savings',
    descriptionAr: 'وصول كامل لجميع المميزات لمدة عام مع توفير 17%',
    price: 30,
    currency: 'USD',
    duration: 'yearly',
    durationMonths: 12,
    popular: true,
    discount: 17,
    originalPrice: 36,
    features: [
      'Everything in Monthly Plan',
      'Save $6/year (17% OFF)',
      'Priority Feature Updates',
      'Extended Offline Storage',
      'Family Sharing (Up to 6 devices)',
      'Exclusive Content Access',
      'Premium Support Chat'
    ],
    featuresAr: [
      'كل مميزات الباقة الشهرية',
      'وفر $6/سنة (خصم 17%)',
      'تحديثات المميزات بأولوية',
      'تخزين إضافي للوضع غير المتصل',
      'مشاركة عائلية (حتى 6 أجهزة)',
      'وصول للمحتوى الحصري',
      'دردشة دعم مميزة'
    ],
    limits: {
      maxGamesPerDay: -1, // غير محدود
      maxStoriesPerWeek: -1, // غير محدود
      maxLevel: -1, // غير محدود
      maxPlayers: -1, // غير محدود
      features: {
        unlimitedStories: true,
        premiumHeroes: true,
        customStories: true,
        allGames: true,
        advancedLevels: true,
        multiplayerMode: true,
        unlimitedPlayers: true,
        offlineMode: true,
        progressSync: true,
        parentalReports: true,
        adFree: true,
        prioritySupport: true
      }
    }
  }
];

// طرق الدفع المتاحة
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: 'credit_card',
    displayName: 'Credit/Debit Card',
    displayNameAr: 'بطاقة ائتمان/خصم',
    icon: '💳'
  },
  {
    type: 'paypal',
    displayName: 'PayPal',
    displayNameAr: 'باي بال',
    icon: '🏦'
  },
  {
    type: 'apple_pay',
    displayName: 'Apple Pay',
    displayNameAr: 'آبل باي',
    icon: '🍎'
  },
  {
    type: 'google_pay',
    displayName: 'Google Pay',
    displayNameAr: 'جوجل باي',
    icon: '🔍'
  }
];

// الميزات حسب الاشتراك
export const getSubscriptionFeatures = (plan: SubscriptionPlan | null): SubscriptionFeatures => {
  if (!plan || !plan.limits) {
    return {
      unlimitedStories: false,
      premiumHeroes: false,
      customStories: false,
      allGames: false,
      advancedLevels: false,
      multiplayerMode: false,
      unlimitedPlayers: false,
      offlineMode: false,
      progressSync: false,
      parentalReports: false,
      adFree: false,
      prioritySupport: false
    };
  }

  return plan.limits.features;
};

// فحص الحدود
export const checkUsageLimits = (plan: SubscriptionPlan | null, usage: UsageStats): {
  canPlayGame: boolean;
  canReadStory: boolean;
  canAccessLevel: (level: number) => boolean;
  canCreatePlayer: boolean;
  remainingGames: number;
  remainingStories: number;
} => {
  if (!plan || !plan.limits) {
    return {
      canPlayGame: true,
      canReadStory: true,
      canAccessLevel: () => true,
      canCreatePlayer: true,
      remainingGames: -1,
      remainingStories: -1
    };
  }

  const { limits } = plan;
  
  return {
    canPlayGame: limits.maxGamesPerDay === -1 || usage.gamesPlayedToday < limits.maxGamesPerDay,
    canReadStory: limits.maxStoriesPerWeek === -1 || usage.storiesReadThisWeek < limits.maxStoriesPerWeek,
    canAccessLevel: (level: number) => limits.maxLevel === -1 || level <= limits.maxLevel,
    canCreatePlayer: limits.maxPlayers === -1 || usage.totalPlayersCreated < limits.maxPlayers,
    remainingGames: limits.maxGamesPerDay === -1 ? -1 : Math.max(0, limits.maxGamesPerDay - usage.gamesPlayedToday),
    remainingStories: limits.maxStoriesPerWeek === -1 ? -1 : Math.max(0, limits.maxStoriesPerWeek - usage.storiesReadThisWeek)
  };
};