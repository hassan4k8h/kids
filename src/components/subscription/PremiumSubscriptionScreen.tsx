import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { revenueCatService, type PurchasesOffering } from '../../services/RevenueCatService';
import { CheckCircle, Star, Crown, Users, Shield, Zap, Gift, ArrowRight, X, RefreshCw } from 'lucide-react';

interface PremiumSubscriptionScreenProps {
  isRTL?: boolean;
  onClose?: () => void;
  onSuccess?: (planId: string) => void;
}

export function PremiumSubscriptionScreen({ 
  isRTL = false, 
  onClose,
  onSuccess 
}: PremiumSubscriptionScreenProps) {
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly_premium');
  const [restoring, setRestoring] = useState(false);
  const [showFeatures, setShowFeatures] = useState<string | null>(null);

  useEffect(() => {
    loadOfferings();
    // Track that user viewed subscription screen
    revenueCatService.trackSubscriptionEvent('view');
  }, []);

  const loadOfferings = async () => {
    try {
      await revenueCatService.initialize();
      const offerings = await revenueCatService.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const handlePurchase = async (planId: string) => {
    setLoading(true);
    try {
      const offering = offerings.find(o => o.identifier === 'default');
      const packageToPurchase = offering?.availablePackages.find(
        p => p.identifier === planId
      );
      
      if (packageToPurchase) {
        revenueCatService.trackSubscriptionEvent('start_trial', planId);
        
        const customerInfo = await revenueCatService.purchasePackage(packageToPurchase);
        
        if (customerInfo.entitlements.active['premium']) {
          revenueCatService.trackSubscriptionEvent('purchase', planId);
          onSuccess?.(planId);
          
          // Show success message
          alert(isRTL ? 'تم الاشتراك بنجاح! مرحباً بك في النسخة المميزة!' : 'Subscription Successful! Welcome to Premium!');
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(isRTL ? 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.' : 'An error occurred while processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await revenueCatService.restorePurchases();
      revenueCatService.trackSubscriptionEvent('restore');
      
      alert(isRTL ? 'تم استعادة مشترياتك بنجاح!' : 'Your purchases have been restored successfully!');
      onSuccess?.('restored');
    } catch (error) {
      alert(isRTL ? 'لم يتم العثور على مشتريات سابقة.' : 'No previous purchases found.');
    } finally {
      setRestoring(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'yearly_premium':
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 'family_plan':
        return <Users className="w-8 h-8 text-blue-500" />;
      default:
        return <Star className="w-8 h-8 text-purple-500" />;
    }
  };

  const getFeatureIcon = (index: number) => {
    const icons = [CheckCircle, Shield, Zap, Gift, Star, Users];
    const IconComponent = icons[index % icons.length];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5 text-green-500 flex-shrink-0" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white p-8 relative overflow-hidden">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white/15"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-white/10 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            </motion.div>
            
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-2"
            >
              {isRTL ? 'اختر خطتك المميزة' : 'Choose Your Premium Plan'}
            </motion.h1>
            
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/90"
            >
              {isRTL ? 'افتح عالماً من التعلم الممتع والآمن' : 'Unlock a world of safe and fun learning'}
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {/* Benefits Banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-200"
          >
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-green-800">
                {isRTL ? '🎉 عرض خاص - تجربة مجانية!' : '🎉 Special Offer - Free Trial!'}
              </h3>
            </div>
            <p className="text-center text-green-700 text-lg">
              {isRTL 
                ? 'جرب جميع الميزات المميزة مجاناً لمدة 7 أيام، ثم ادفع فقط إذا أعجبك!' 
                : 'Try all premium features free for 7 days, then pay only if you love it!'}
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {revenueCatService.SUBSCRIPTION_PLANS.map((plan, index) => {
              const isSelected = selectedPlan === plan.id;
              const isPopular = plan.popular;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    isPopular ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <Star className="w-4 h-4 inline mr-1" />
                        {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className="mb-4">
                        {getPlanIcon(plan.id)}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {isRTL ? plan.titleAr : plan.title}
                      </h3>
                      
                      {plan.discount && (
                        <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                          {plan.discount}
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-1">
                          {plan.price}
                        </div>
                        <div className="text-gray-600">
                          /{isRTL ? (plan.period === 'month' ? 'شهر' : 'سنة') : plan.period}
                        </div>
                        {plan.originalPrice && (
                          <div className="text-gray-400 line-through text-sm">
                            {plan.originalPrice}
                          </div>
                        )}
                        {plan.trialDays && (
                          <div className="text-green-600 text-sm font-semibold mt-1">
                            {isRTL ? `${plan.trialDays} أيام مجاناً` : `${plan.trialDays} days free`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="space-y-3 mb-6">
                      {(isRTL ? plan.featuresAr : plan.features).slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3 rtl:space-x-reverse">
                          {getFeatureIcon(featureIndex)}
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.features.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFeatures(showFeatures === plan.id ? null : plan.id);
                          }}
                          className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center"
                        >
                          {isRTL ? 'عرض المزيد' : 'Show more'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>

                    {/* Expanded Features */}
                    <AnimatePresence>
                      {showFeatures === plan.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <div className="space-y-2 pt-4 border-t border-gray-100">
                            {(isRTL ? plan.featuresAr : plan.features).slice(3).map((feature, featureIndex) => (
                              <div key={featureIndex + 3} className="flex items-center space-x-3 rtl:space-x-reverse">
                                {getFeatureIcon(featureIndex + 3)}
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Select Button */}
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected 
                        ? (isRTL ? 'محدد' : 'Selected')
                        : (isRTL ? 'اختر هذه الخطة' : 'Select Plan')
                      }
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            {/* Subscribe Button */}
            <button
              onClick={() => handlePurchase(selectedPlan)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isRTL ? 'جاري المعالجة...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span>
                    {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
                  </span>
                </>
              )}
            </button>

            {/* Restore Button */}
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {restoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? 'جاري الاستعادة...' : 'Restoring...'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{isRTL ? 'استعادة المشتريات' : 'Restore Purchases'}</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Terms and Privacy */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 text-center text-sm text-gray-500 leading-relaxed"
          >
            <p className="mb-2">
              {isRTL 
                ? 'سيتم تجديد الاشتراك تلقائياً. يمكنك إلغاء التجديد التلقائي في أي وقت من إعدادات حسابك.'
                : 'Subscription automatically renews. You can cancel auto-renewal at any time from your account settings.'
              }
            </p>
            <p>
              {isRTL 
                ? 'بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية.'
                : 'By continuing, you agree to our Terms of Service and Privacy Policy.'
              }
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}