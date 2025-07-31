import { Capacitor } from '@capacitor/core';

// Types for Revenue Cat integration
interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
}

interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesProduct;
  offeringIdentifier: string;
}

interface PurchasesProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: PurchasesIntroPrice;
}

interface PurchasesIntroPrice {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
  periodUnit: string;
  periodNumberOfUnits: number;
}

interface CustomerInfo {
  originalAppUserId: string;
  allPurchaseDates: Record<string, string>;
  entitlements: {
    active: Record<string, EntitlementInfo>;
    all: Record<string, EntitlementInfo>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: Transaction[];
  firstSeen: string;
  originalApplicationVersion: string;
  requestDate: string;
}

interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate?: string;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  ownershipType: string;
}

interface Transaction {
  transactionIdentifier: string;
  productIdentifier: string;
  purchaseDate: string;
}

interface SubscriptionPlan {
  id: string;
  title: string;
  titleAr: string;
  price: string;
  period: string;
  features: string[];
  featuresAr: string[];
  popular?: boolean;
  discount?: string;
  originalPrice?: string;
  trialDays?: number;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private customerInfo: CustomerInfo | null = null;
  
  // Revenue Cat API Keys (replace with your actual keys)
  // API keys would be configured here in production

  // Subscription plans configuration
  public readonly SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'monthly_premium',
      title: 'Monthly Premium',
      titleAr: 'الاشتراك الشهري المميز',
      price: '$4.99',
      period: 'month',
      trialDays: 7,
      features: [
        'Unlimited access to all games',
        'Ad-free experience',
        'Progress tracking',
        'Parental reports',
        'Offline mode',
        'Priority support'
      ],
      featuresAr: [
        'وصول غير محدود لجميع الألعاب',
        'تجربة خالية من الإعلانات',
        'تتبع التقدم',
        'تقارير للوالدين',
        'وضع عدم الاتصال',
        'دعم أولوية'
      ]
    },
    {
      id: 'yearly_premium',
      title: 'Yearly Premium',
      titleAr: 'الاشتراك السنوي المميز',
      price: '$39.99',
      originalPrice: '$59.88',
      discount: '33% OFF',
      period: 'year',
      popular: true,
      trialDays: 7,
      features: [
        'Everything in Monthly Premium',
        'Save 33% compared to monthly',
        'Priority customer support',
        'Early access to new features',
        'Family sharing (up to 6 kids)',
        'Exclusive premium content'
      ],
      featuresAr: [
        'كل ما في الاشتراك الشهري',
        'توفير 33% مقارنة بالشهري',
        'دعم عملاء أولوية',
        'وصول مبكر للميزات الجديدة',
        'مشاركة عائلية (حتى 6 أطفال)',
        'محتوى مميز حصري'
      ]
    },
    {
      id: 'family_plan',
      title: 'Family Plan',
      titleAr: 'الخطة العائلية',
      price: '$7.99',
      period: 'month',
      trialDays: 14,
      features: [
        'Up to 6 children profiles',
        'Individual progress tracking',
        'Advanced parental controls',
        'Family achievements',
        'Shared premium content',
        'Multi-device sync'
      ],
      featuresAr: [
        'حتى 6 ملفات شخصية للأطفال',
        'تتبع فردي للتقدم',
        'ضوابط والدين متقدمة',
        'إنجازات عائلية',
        'محتوى مميز مشترك',
        'مزامنة متعددة الأجهزة'
      ]
    }
  ];

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      const platform = Capacitor.getPlatform();

      // For web/development, we'll simulate Revenue Cat
      if (platform === 'web') {
        console.log('Revenue Cat initialized in web mode (simulation)');
        this.isInitialized = true;
        return true;
      }

      // In a real implementation, you would use:
      // import Purchases from 'react-native-purchases';
      // await Purchases.setDebugLogsEnabled(true);
      // await Purchases.configure({ apiKey });
      
      if (userId) {
        // await Purchases.logIn(userId);
      }

      this.isInitialized = true;
      console.log('Revenue Cat initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Revenue Cat:', error);
      return false;
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Simulate offerings for web development
      const mockOfferings: PurchasesOffering[] = [
        {
          identifier: 'default',
          serverDescription: 'Default offering',
          availablePackages: this.SUBSCRIPTION_PLANS.map(plan => ({
            identifier: plan.id,
            packageType: plan.period === 'year' ? 'ANNUAL' : 'MONTHLY',
            offeringIdentifier: 'default',
            product: {
              identifier: plan.id,
              description: plan.features.join(', '),
              title: plan.title,
              price: parseFloat(plan.price.replace('$', '')),
              priceString: plan.price,
              currencyCode: 'USD',
              ...(plan.trialDays && {
                introPrice: {
                  price: 0,
                  priceString: 'Free',
                  period: `P${plan.trialDays}D`,
                  cycles: 1,
                  periodUnit: 'DAY',
                  periodNumberOfUnits: plan.trialDays
                } as PurchasesIntroPrice
              })
            }
          }))
        }
      ];

      return mockOfferings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Simulate purchase for web development
      const mockCustomerInfo: CustomerInfo = {
        originalAppUserId: 'user_123',
        allPurchaseDates: {
          [packageToPurchase.identifier]: new Date().toISOString()
        },
        entitlements: {
          active: {
            premium: {
              identifier: 'premium',
              isActive: true,
              willRenew: true,
              periodType: packageToPurchase.packageType === 'ANNUAL' ? 'NORMAL' : 'NORMAL',
              latestPurchaseDate: new Date().toISOString(),
              originalPurchaseDate: new Date().toISOString(),
              expirationDate: this.calculateExpirationDate(packageToPurchase.packageType),
              store: Capacitor.getPlatform() === 'ios' ? 'APP_STORE' : 'PLAY_STORE',
              productIdentifier: packageToPurchase.identifier,
              isSandbox: true,
              ownershipType: 'PURCHASED'
            }
          },
          all: {}
        },
        activeSubscriptions: [packageToPurchase.identifier],
        allPurchasedProductIdentifiers: [packageToPurchase.identifier],
        nonSubscriptionTransactions: [],
        firstSeen: new Date().toISOString(),
        originalApplicationVersion: '1.0.0',
        requestDate: new Date().toISOString()
      };

      this.customerInfo = mockCustomerInfo;
      
      // Store purchase info locally
      localStorage.setItem('premium_subscription', JSON.stringify({
        active: true,
        plan: packageToPurchase.identifier,
        purchaseDate: new Date().toISOString(),
        expirationDate: this.calculateExpirationDate(packageToPurchase.packageType)
      }));

      console.log('Purchase successful:', packageToPurchase.identifier);
      return mockCustomerInfo;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw new Error('Purchase failed. Please try again.');
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check for stored purchases
      const storedPurchase = localStorage.getItem('premium_subscription');
      if (storedPurchase) {
        const purchase = JSON.parse(storedPurchase);
        const expirationDate = new Date(purchase.expirationDate);
        const isActive = expirationDate > new Date();

        if (isActive) {
          const mockCustomerInfo: CustomerInfo = {
            originalAppUserId: 'user_123',
            allPurchaseDates: {
              [purchase.plan]: purchase.purchaseDate
            },
            entitlements: {
              active: isActive ? {
                premium: {
                  identifier: 'premium',
                  isActive: true,
                  willRenew: true,
                  periodType: 'NORMAL',
                  latestPurchaseDate: purchase.purchaseDate,
                  originalPurchaseDate: purchase.purchaseDate,
                  expirationDate: purchase.expirationDate,
                  store: Capacitor.getPlatform() === 'ios' ? 'APP_STORE' : 'PLAY_STORE',
                  productIdentifier: purchase.plan,
                  isSandbox: true,
                  ownershipType: 'PURCHASED'
                }
              } : {},
              all: {}
            },
            activeSubscriptions: isActive ? [purchase.plan] : [],
            allPurchasedProductIdentifiers: [purchase.plan],
            nonSubscriptionTransactions: [],
            firstSeen: purchase.purchaseDate,
            originalApplicationVersion: '1.0.0',
            requestDate: new Date().toISOString()
          };

          this.customerInfo = mockCustomerInfo;
          return mockCustomerInfo;
        }
      }

      throw new Error('No active purchases found');
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('No previous purchases found');
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.customerInfo) {
        return this.customerInfo;
      }

      // Try to restore from local storage
      try {
        await this.restorePurchases();
        return this.customerInfo;
      } catch {
        return null;
      }
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  async checkSubscriptionStatus(): Promise<{
    isActive: boolean;
    plan?: string;
    expirationDate?: string;
    willRenew?: boolean;
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (customerInfo?.entitlements.active.premium) {
        const premium = customerInfo.entitlements.active.premium;
        return {
          isActive: premium.isActive,
          plan: premium.productIdentifier,
          ...(premium.expirationDate && { expirationDate: premium.expirationDate }),
          willRenew: premium.willRenew
        };
      }

      return { isActive: false };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return { isActive: false };
    }
  }

  async cancelSubscription(): Promise<boolean> {
    try {
      // In a real implementation, this would guide users to cancel in their device settings
      // For web simulation, we'll just remove the local storage
      localStorage.removeItem('premium_subscription');
      this.customerInfo = null;
      
      console.log('Subscription cancelled (simulation)');
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  private calculateExpirationDate(packageType: string): string {
    const now = new Date();
    if (packageType === 'ANNUAL') {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  }

  // Analytics and tracking methods
  trackSubscriptionEvent(event: 'view' | 'start_trial' | 'purchase' | 'cancel' | 'restore', planId?: string) {
    const eventData = {
      event_type: event,
      plan_id: planId,
      timestamp: Date.now(),
      platform: Capacitor.getPlatform()
    };

    console.log('Subscription event tracked:', eventData);
    
    // In a real implementation, send to analytics service
    // analytics.track('subscription_event', eventData);
  }

  // Helper method to format price for display
  formatPrice(price: number, currencyCode: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(price);
  }

  // Helper method to get localized plan info
  getLocalizedPlan(planId: string, isRTL: boolean = false): SubscriptionPlan | undefined {
    const plan = this.getPlanById(planId);
    if (!plan) return undefined;

    return {
      ...plan,
      title: isRTL ? plan.titleAr : plan.title,
      features: isRTL ? plan.featuresAr : plan.features
    };
  }
}

// Export singleton instance
export const revenueCatService = RevenueCatService.getInstance();
export type { SubscriptionPlan, CustomerInfo, PurchasesOffering, PurchasesPackage };