import { SubscriptionState, SubscriptionPlan, UsageStats } from '../types/Subscription';
import emailService from './EmailService';

class SubscriptionService {
  private readonly STORAGE_KEY = 'skilloo_subscription_data';
  private readonly USAGE_KEY = 'skilloo_usage_data';
  
  // هيكل تخزين البيانات: { [userId]: SubscriptionState }
  private subscriptionData: Record<string, SubscriptionState> = {};
  private usageData: Record<string, UsageStats & { lastReset: string }> = {};
  
  private listeners: Array<(state: SubscriptionState) => void> = [];
  private currentUserId: string | null = null;
  private currentUserData: { email: string; name: string } | null = null;

  constructor() {
    this.loadData();
    this.initializeCleanupTimer();
  }

  // تحميل البيانات من التخزين المحلي
  private loadData(): void {
    try {
      const storedSubscriptions = localStorage.getItem(this.STORAGE_KEY);
      const storedUsage = localStorage.getItem(this.USAGE_KEY);
      
      if (storedSubscriptions) {
        this.subscriptionData = JSON.parse(storedSubscriptions);
      }
      
      if (storedUsage) {
        this.usageData = JSON.parse(storedUsage);
      }
      
      // تنظيف البيانات المنتهية الصلاحية
      this.cleanupExpiredData();
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      this.subscriptionData = {};
      this.usageData = {};
    }
  }

  // حفظ البيانات في التخزين المحلي
  private saveData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.subscriptionData));
      localStorage.setItem(this.USAGE_KEY, JSON.stringify(this.usageData));
    } catch (error) {
      console.error('Error saving subscription data:', error);
    }
  }

  // تنظيف البيانات المنتهية الصلاحية
  private cleanupExpiredData(): void {
    let hasExpired = false;
    
    // Note: Subscription expiry logic removed as SubscriptionPlan doesn't have expiresAt property
    // This would need to be implemented using a separate subscription tracking mechanism
    
    if (hasExpired) {
      this.saveData();
    }
  }

  // تهيئة مؤقت التنظيف
  private initializeCleanupTimer(): void {
    // تنظيف كل ساعة
    setInterval(() => {
      this.cleanupExpiredData();
      this.resetDailyUsageIfNeeded();
      this.resetWeeklyUsageIfNeeded();
    }, 60 * 60 * 1000);
  }

  // إنشاء بيانات اشتراك افتراضية للمستخدم الجديد
  private createDefaultSubscription(userId: string): SubscriptionState {
    const freePlan = this.getFreePlan();
    const defaultUsage = this.createDefaultUsage();
    
    const subscription: SubscriptionState = {
      isSubscribed: false,
      currentSubscription: null,
      activePlan: freePlan,
      daysRemaining: 0,
      trialUsed: false,
      paymentMethods: [],
      usage: defaultUsage
    };
    
    console.log(`✅ Default subscription created for user: ${userId}`);
    return subscription;
  }

  // إنشاء إحصائيات استخدام افتراضية
  private createDefaultUsage(): UsageStats {
    return {
      gamesPlayedToday: 0,
      storiesReadThisWeek: 0,
      currentMaxLevel: 1,
      totalPlayersCreated: 0,
      featuresUsed: [],
      lastGamePlayed: null,
      lastStoryRead: null,
      lastResetDate: new Date().toISOString(),
      streakDays: 0,
      lastActiveDate: undefined,
      weeklyStats: {
        gamesPlayed: 0,
        storiesRead: 0,
        timeSpent: 0,
        achievementsUnlocked: 0
      },
      monthlyStats: {
        gamesPlayed: 0,
        storiesRead: 0,
        timeSpent: 0,
        achievementsUnlocked: 0
      }
    };
  }

  // ضمان وجود بيانات للمستخدم
  private ensureUserData(userId: string): void {
    if (!this.subscriptionData[userId]) {
      this.subscriptionData[userId] = this.createDefaultSubscription(userId);
      this.usageData[userId] = {
        ...this.createDefaultUsage(),
        lastReset: new Date().toISOString()
      };
      this.saveData();
    }
  }

  // تعيين المستخدم الحالي
  setCurrentUser(userId: string | null, userData?: { email: string; name: string }): void {
    this.currentUserId = userId;
    this.currentUserData = userData || null;
    
    if (userId) {
      this.ensureUserData(userId);
      // إشعار المستمعين بالحالة الجديدة
      this.notifyListeners();
    }
  }

  // الحصول على بيانات المستخدم الحالي
  private getCurrentUserData(): { email: string; name: string } | null {
    return this.currentUserData;
  }

  // الحصول على حالة الاشتراك للمستخدم الحالي
  getSubscriptionState(): SubscriptionState {
    if (!this.currentUserId) {
      return this.createDefaultSubscription('guest');
    }
    
    this.ensureUserData(this.currentUserId);
    return this.subscriptionData[this.currentUserId];
  }

  // الحصول على حالة الاشتراك لمستخدم محدد
  getUserSubscriptionState(userId: string): SubscriptionState {
    this.ensureUserData(userId);
    return this.subscriptionData[userId];
  }

  // إشعار المستمعين بتغيير الحالة
  private notifyListeners(): void {
    if (this.currentUserId) {
      const state = this.getSubscriptionState();
      this.listeners.forEach(listener => listener(state));
    }
  }

  // الاشتراك في تغييرات حالة الاشتراك
  subscribe(listener: (state: SubscriptionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // الحصول على الباقة المجانية
  private getFreePlan(): SubscriptionPlan {
    return {
      id: 'free',
      name: 'Free Plan',
      nameAr: 'الباقة المجانية',
      description: 'Limited access to games and stories',
      descriptionAr: 'وصول محدود للألعاب والقصص',
      price: 0,
      currency: 'USD',
      duration: 'free',
      durationMonths: 0,
      features: [
        'access_to_basic_games',
        'limited_stories_per_week',
        'up_to_two_player_profiles',
        'basic_progress_tracking'
      ],
      featuresAr: [
        'الوصول للألعاب الأساسية',
        'قصص محدودة أسبوعياً',
        'حتى ملفين للأطفال',
        'تتبع التقدم الأساسي'
      ],
      limits: {
        maxGamesPerDay: -1,
        maxStoriesPerWeek: -1,
        maxLevel: -1,
        maxPlayers: -1,
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
    };
  }

  // الحصول على الباقات المتاحة
  getAvailablePlans(): SubscriptionPlan[] { return [ this.getFreePlan() ]; }

  // ترقية الاشتراك
  async upgradePlan(userId: string, planId: string, paymentMethod?: string): Promise<boolean> {
    try {
      this.ensureUserData(userId);
      
      // النظام الآن مجاني بالكامل، أي ترقية تعني الباقة المجانية فقط
      const newPlan = this.getFreePlan();

      // محاكاة معالجة الدفع
      // لا يوجد دفع

      const currentSubscription = this.subscriptionData[userId];
      const expiryDate = new Date();
      
      if (planId === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (planId === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // تحديث الاشتراك
      this.subscriptionData[userId] = {
        ...currentSubscription,
        activePlan: newPlan
      };
      
      // تسجيل معلومات الترقية في console
      console.log(`✅ User ${userId} set to free plan`);

      this.saveData();
      
      // إرسال بريد إشعار بتحديث الاشتراك
      // لا رسائل بريد للاشتراك المجاني
      
      // إشعار المستمعين إذا كان هذا المستخدم الحالي
      if (userId === this.currentUserId) {
        this.notifyListeners();
      }

      console.log(`✅ Plan upgraded for user ${userId}: ${newPlan.name}`);
      return true;
    } catch (error) {
      console.error('❌ Plan upgrade failed:', error);
      return false;
    }
  }

  // إنشاء اشتراك جديد
  async createSubscription(
    userId: string, 
    planId: string, 
    paymentMethod: any, 
    billingInfo: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.ensureUserData(userId);
      
      const availablePlans = this.getAvailablePlans();
      const newPlan = availablePlans.find(p => p.id === planId);
      
      if (!newPlan) {
        throw new Error('الباقة المحددة غير متاحة');
      }

      // محاكاة معالجة الدفع
      if (newPlan.price > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`💳 Payment processed: $${newPlan.price} for plan ${planId}`);
      }

      const currentSubscription = this.subscriptionData[userId];
      const startDate = new Date();
      const expiryDate = new Date();
      
      if (planId === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (planId === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // تحديث الاشتراك
       this.subscriptionData[userId] = {
         ...currentSubscription,
         isSubscribed: true,
         activePlan: newPlan,
         currentSubscription: {
           id: `sub_${Date.now()}`,
           userId: userId,
           planId: planId,
           startDate: startDate.toISOString(),
           endDate: expiryDate.toISOString(),
           status: 'active',
           paymentMethod: paymentMethod,
           autoRenew: true,
           createdAt: startDate.toISOString(),
           updatedAt: startDate.toISOString()
         },
         daysRemaining: Math.ceil((expiryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
         paymentMethods: [paymentMethod]
       };
      
      console.log(`✅ Subscription created for user ${userId}: ${planId} plan`);

      this.saveData();
      
      // إشعار المستمعين إذا كان هذا المستخدم الحالي
      if (userId === this.currentUserId) {
        this.notifyListeners();
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Subscription creation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // التحقق من صحة الاشتراك
  isSubscriptionValid(userId: string): boolean {
    this.ensureUserData(userId);
    
    const subscription = this.subscriptionData[userId];
    
    if (!subscription) {
      return false;
    }
    
    const plan = subscription.activePlan;
    
    if (!plan || plan.id === 'free') {
      return true; // الباقة المجانية دائماً صالحة
    }
    
    if (subscription.currentSubscription && subscription.currentSubscription.endDate) {
      const expiryDate = new Date(subscription.currentSubscription.endDate);
      const isValid = expiryDate > new Date();
      
      if (!isValid) {
        console.log(`⏰ Subscription expired for user ${userId}`);
        // تحويل إلى الباقة المجانية
        this.subscriptionData[userId].activePlan = this.getFreePlan();
        this.saveData();
        
        if (userId === this.currentUserId) {
          this.notifyListeners();
        }
      }
      
      return isValid;
    }
    
    return true;
  }

  // فحص إمكانية الوصول للمحتوى
  canAccessContent(type: 'game' | 'story' | 'level', level?: number): { canAccess: boolean; reason?: string } {
    if (!this.currentUserId) {
      return { canAccess: false, reason: 'لم يتم تسجيل الدخول' };
    }

    this.ensureUserData(this.currentUserId);
    
    const subscription = this.subscriptionData[this.currentUserId];
    const usage = this.usageData[this.currentUserId];
    
    if (!subscription) {
      return { canAccess: false, reason: 'بيانات الاشتراك غير متوفرة' };
    }
    
    const plan = subscription.activePlan;

    if (!this.isSubscriptionValid(this.currentUserId)) {
      return { canAccess: false, reason: 'انتهت صلاحية الاشتراك' };
    }

    switch (type) {
      case 'game':
        if (plan.limits.maxGamesPerDay === -1) {
          return { canAccess: true };
        }
        if (usage.gamesPlayedToday >= plan.limits.maxGamesPerDay) {
          return { canAccess: false, reason: 'تم الوصول للحد الأقصى للألعاب اليومية' };
        }
        return { canAccess: true };

      case 'story':
        if (plan.limits.maxStoriesPerWeek === -1) {
          return { canAccess: true };
        }
        if (usage.storiesReadThisWeek >= plan.limits.maxStoriesPerWeek) {
          return { canAccess: false, reason: 'تم الوصول للحد الأقصى للقصص الأسبوعية' };
        }
        return { canAccess: true };

      case 'level':
        if (plan.limits.maxLevel === -1) {
          return { canAccess: true };
        }
        if (level && level > plan.limits.maxLevel) {
          return { canAccess: false, reason: `المستوى ${level} غير متاح في باقتك الحالية` };
        }
        return { canAccess: true };

      default:
        return { canAccess: false, reason: 'نوع محتوى غير معروف' };
    }
  }

  // تسجيل الاستخدام
  recordUsage(userId: string, type: 'game' | 'story', level?: number): void {
    this.ensureUserData(userId);
    
    const usage = this.usageData[userId];
    const subscription = this.subscriptionData[userId];
    // تحديث سلسلة الأيام
    const todayStr = new Date().toDateString();
    const lastActiveStr = usage.lastActiveDate ? new Date(usage.lastActiveDate).toDateString() : null;
    if (lastActiveStr !== todayStr) {
      const yesterdayStr = new Date(Date.now() - 24*60*60*1000).toDateString();
      usage.streakDays = lastActiveStr === yesterdayStr ? (usage.streakDays + 1) : 1;
      usage.lastActiveDate = new Date().toISOString();
    }
    
    switch (type) {
      case 'game':
        usage.gamesPlayedToday++;
        usage.weeklyStats.gamesPlayed++;
        usage.monthlyStats.gamesPlayed++;
        usage.lastGamePlayed = new Date().toISOString();
        
        if (level && level > usage.currentMaxLevel) {
          usage.currentMaxLevel = level;
        }
        break;

      case 'story':
        usage.storiesReadThisWeek++;
        usage.weeklyStats.storiesRead++;
        usage.monthlyStats.storiesRead++;
        usage.lastStoryRead = new Date().toISOString();
        break;
    }

    this.saveData();
    
    // إشعار المستمعين إذا كان هذا المستخدم الحالي
    if (userId === this.currentUserId) {
      this.notifyListeners();
    }

    console.log(`📊 Usage recorded for user ${userId}: ${type}${level ? ` (level ${level})` : ''}`);
  }

  // الحصول على إحصائيات الاستخدام
  getUserUsageStats(userId: string): UsageStats {
    this.ensureUserData(userId);
    return this.usageData[userId];
  }

  // إعادة تعيين الاستخدام اليومي
  private resetDailyUsageIfNeeded(): void {
    const today = new Date().toDateString();
    
    Object.keys(this.usageData).forEach(userId => {
      const usage = this.usageData[userId];
      
      if (!usage) {
        return;
      }
      
      const lastReset = new Date(usage.lastReset).toDateString();
      // تحديث streak يوميًا عند أول تفاعل في اليوم
      const lastActiveStr = usage.lastActiveDate ? new Date(usage.lastActiveDate).toDateString() : null;
      if (lastActiveStr && lastActiveStr !== today) {
        const yesterdayStr = new Date(Date.now() - 24*60*60*1000).toDateString();
        usage.streakDays = lastActiveStr === yesterdayStr ? (usage.streakDays + 1) : 1;
      }

      if (lastReset !== today) {
        usage.gamesPlayedToday = 0;
        usage.lastReset = new Date().toISOString();
        console.log(`🔄 Daily usage reset for user ${userId}`);
      }
    });
    
    this.saveData();
  }

  // إعادة تعيين الاستخدام الأسبوعي
  private resetWeeklyUsageIfNeeded(): void {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    Object.keys(this.usageData).forEach(userId => {
      const usage = this.usageData[userId];
      
      if (!usage) {
        return;
      }
      
      const lastReset = new Date(usage.lastReset);
      
      if (lastReset < weekStart) {
        usage.storiesReadThisWeek = 0;
        usage.weeklyStats = {
          gamesPlayed: 0,
          storiesRead: 0,
          timeSpent: 0,
          achievementsUnlocked: 0
        };
        console.log(`🔄 Weekly usage reset for user ${userId}`);
      }
    });
    
    this.saveData();
  }

  // حذف بيانات المستخدم
  deleteUserData(userId: string): boolean {
    try {
      if (this.subscriptionData[userId]) {
        delete this.subscriptionData[userId];
      }
      if (this.usageData[userId]) {
        delete this.usageData[userId];
      }
      
      this.saveData();
      
      console.log(`✅ Subscription data deleted for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting subscription data:', error);
      return false;
    }
  }

  // تصدير بيانات المستخدم
  exportUserData(userId: string): any {
    this.ensureUserData(userId);
    
    return {
      userId,
      exportDate: new Date().toISOString(),
      subscription: this.subscriptionData[userId],
      usage: this.usageData[userId]
    };
  }

  // الحصول على إحصائيات عامة (للمطورين)
  getServiceStats(): {
    totalUsers: number;
    activeSubscriptions: number;
    revenue: number;
    usageStats: any;
  } {
    const totalUsers = Object.keys(this.subscriptionData).length;
    let activeSubscriptions = 0;
    let revenue = 0;
    
    Object.values(this.subscriptionData).forEach(subscription => {
      if (!subscription || !subscription.activePlan) {
        return;
      }
      
      if (subscription.activePlan.id !== 'free') {
        activeSubscriptions++;
      }
      
      // حساب الإيرادات من الاشتراكات النشطة
      if (subscription.activePlan.price) {
        revenue += subscription.activePlan.price;
      }
    });
    
    return {
      totalUsers,
      activeSubscriptions,
      revenue,
      usageStats: {
        totalGamesPlayed: Object.values(this.usageData).reduce((sum, usage) => 
          sum + usage.weeklyStats.gamesPlayed, 0),
        totalStoriesRead: Object.values(this.usageData).reduce((sum, usage) => 
          sum + usage.weeklyStats.storiesRead, 0)
      }
    };
  }

  // الحصول على مدفوعات المستخدم
  getUserPayments(userId: string): any[] {
    this.ensureUserData(userId);
    const subscription = this.subscriptionData[userId];
    
    if (!subscription || !subscription.currentSubscription) {
      return [];
    }
    
    // إرجاع تاريخ المدفوعات المحاكي
    return [{
      id: `payment_${subscription.currentSubscription.id}`,
      subscriptionId: subscription.currentSubscription.id,
      amount: subscription.activePlan?.price || 0,
      currency: subscription.activePlan?.currency || 'USD',
      status: 'completed',
      paymentMethod: subscription.currentSubscription.paymentMethod,
      createdAt: subscription.currentSubscription.createdAt,
      description: `Payment for ${subscription.activePlan?.name} plan`
    }];
  }

  // تجديد الاشتراك
  async renewSubscription(userId: string, paymentMethod?: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.ensureUserData(userId);
      const subscription = this.subscriptionData[userId];
      
      if (!subscription || !subscription.currentSubscription || !subscription.activePlan) {
        return { success: false, error: 'No active subscription to renew' };
      }
      
      const currentPlan = subscription.activePlan;
      const currentEndDate = new Date(subscription.currentSubscription.endDate);
      const newEndDate = new Date(currentEndDate);
      
      // إضافة فترة الاشتراك الجديدة
      if (currentPlan.duration === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (currentPlan.duration === 'yearly') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }
      
      // محاكاة معالجة الدفع
      console.log(`💳 Processing renewal payment for user ${userId}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // تحديث الاشتراك
      this.subscriptionData[userId] = {
        ...subscription,
        currentSubscription: {
          ...subscription.currentSubscription,
          endDate: newEndDate.toISOString(),
          updatedAt: new Date().toISOString(),
          paymentMethod: paymentMethod || subscription.currentSubscription.paymentMethod
        },
        daysRemaining: Math.ceil((newEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      };
      
      console.log(`✅ Subscription renewed for user ${userId} until ${newEndDate.toISOString()}`);
      
      this.saveData();
      
      if (userId === this.currentUserId) {
        this.notifyListeners();
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Subscription renewal failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // إلغاء الاشتراك
  async cancelSubscription(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.ensureUserData(userId);
      const subscription = this.subscriptionData[userId];
      
      if (!subscription || !subscription.currentSubscription) {
        return { success: false, error: 'No active subscription to cancel' };
      }
      
      console.log(`🚫 Cancelling subscription for user ${userId}...`);
      
      // تحديث الاشتراك للإلغاء
      this.subscriptionData[userId] = {
        ...subscription,
        isSubscribed: false,
        activePlan: this.getFreePlan(),
        currentSubscription: {
          ...subscription.currentSubscription,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: reason || 'User requested cancellation',
          updatedAt: new Date().toISOString()
        },
        daysRemaining: 0
      };
      
      console.log(`✅ Subscription cancelled for user ${userId}`);
      
      this.saveData();
      
      if (userId === this.currentUserId) {
        this.notifyListeners();
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Subscription cancellation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const subscriptionService = new SubscriptionService();