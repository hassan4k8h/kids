import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { 
  Crown, Zap, Star, ArrowRight, X, Lock, 
  Timer, BookOpen, GamepadIcon, Users
} from "lucide-react";
import { subscriptionService } from "../../services/SubscriptionService";
import { SubscriptionState, SUBSCRIPTION_PLANS } from "../../types/Subscription";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isRTL: boolean;
  trigger?: 'game_limit' | 'story_limit' | 'level_limit' | 'general';
  level?: number;
}

export function UpgradePrompt({ isOpen, onClose, onUpgrade, isRTL, trigger = 'general', level }: UpgradePromptProps) {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(
    subscriptionService.getSubscriptionState()
  );

  useEffect(() => {
    const unsubscribe = subscriptionService.subscribe((newState) => {
      setSubscriptionState(newState);
    });

    return unsubscribe;
  }, []);

  if (!isOpen || !subscriptionState.activePlan) return null;

  const { usage, activePlan } = subscriptionState;
  const limits = activePlan.limits;

  if (!limits) return null;

  // حساب النسب المئوية للاستخدام
  const gameUsagePercent = limits.maxGamesPerDay > 0 
    ? (usage.gamesPlayedToday / limits.maxGamesPerDay) * 100 
    : 0;
  const storyUsagePercent = limits.maxStoriesPerWeek > 0 
    ? (usage.storiesReadThisWeek / limits.maxStoriesPerWeek) * 100 
    : 0;

  // محتوى حسب نوع التحفيز
  const getPromptContent = () => {
    switch (trigger) {
      case 'game_limit':
        return {
          title: isRTL ? 'انتهت ألعابك اليومية! 🎮' : 'Daily Games Finished! 🎮',
          description: isRTL 
            ? 'لقد لعبت جميع الألعاب المتاحة اليوم. ترقى للباقة المميزة للعب بلا حدود!'
            : 'You\'ve played all available games today. Upgrade to premium for unlimited gaming!',
          icon: GamepadIcon,
          color: 'from-purple-500 to-pink-600'
        };
      
      case 'story_limit':
        return {
          title: isRTL ? 'انتهت قصصك الأسبوعية! 📚' : 'Weekly Stories Finished! 📚',
          description: isRTL 
            ? 'لقد قرأت جميع القصص المتاحة هذا الأسبوع. ترقى للوصول لمئات القصص الإضافية!'
            : 'You\'ve read all available stories this week. Upgrade for hundreds more stories!',
          icon: BookOpen,
          color: 'from-blue-500 to-cyan-600'
        };
      
      case 'level_limit':
        return {
          title: isRTL ? `المستوى ${level} مغلق! 🔒` : `Level ${level} Locked! 🔒`,
          description: isRTL 
            ? `أحسنت! وصلت للمستوى ${level}. ترقى للباقة المميزة لإلغاء قفل جميع المستويات المتقدمة!`
            : `Great job! You reached level ${level}. Upgrade to premium to unlock all advanced levels!`,
          icon: Lock,
          color: 'from-orange-500 to-red-600'
        };
      
      default:
        return {
          title: isRTL ? 'ترقى لتجربة أفضل! ⭐' : 'Upgrade for Better Experience! ⭐',
          description: isRTL 
            ? 'اكتشف المزيد من المغامرات والقصص مع الباقة المميزة!'
            : 'Discover more adventures and stories with premium subscription!',
          icon: Star,
          color: 'from-purple-500 to-pink-600'
        };
    }
  };

  const content = getPromptContent();
  const premiumPlans = SUBSCRIPTION_PLANS.filter(p => p.id !== 'free');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`relative p-8 bg-gradient-to-br ${content.color} text-white rounded-t-3xl overflow-hidden`}>
              <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
                >
                  <content.icon className="w-10 h-10" />
                </motion.div>
                
                <h2 className="text-3xl font-extra-bold mb-3 text-bold-shadow">
                  {content.title}
                </h2>
                
                <p className="text-lg font-bold text-white/90 leading-relaxed">
                  {content.description}
                </p>
              </div>

              {/* خلفية زخرفية */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/10 rounded-full" />
            </div>

            {/* Current Usage Stats */}
            <div className="p-6 border-b">
              <h3 className="text-xl font-extra-bold text-gray-800 mb-4 text-center">
                {isRTL ? 'استخدامك الحالي' : 'Your Current Usage'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <GamepadIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-gray-700">
                        {isRTL ? 'الألعاب اليومية' : 'Daily Games'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {usage.gamesPlayedToday}/{limits.maxGamesPerDay}
                    </span>
                  </div>
                  <Progress value={gameUsagePercent} className="h-2" />
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-700">
                        {isRTL ? 'القصص الأسبوعية' : 'Weekly Stories'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {usage.storiesReadThisWeek}/{limits.maxStoriesPerWeek}
                    </span>
                  </div>
                  <Progress value={storyUsagePercent} className="h-2" />
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-extra-bold text-gray-800 mb-1">
                    {usage.currentMaxLevel}
                  </div>
                  <div className="text-sm font-bold text-gray-600">
                    {isRTL ? 'أعلى مستوى' : 'Highest Level'}
                  </div>
                </Card>

                <Card className="p-4 text-center">
                  <div className="text-2xl font-extra-bold text-gray-800 mb-1">
                    {limits.maxLevel > 0 ? limits.maxLevel : '∞'}
                  </div>
                  <div className="text-sm font-bold text-gray-600">
                    {isRTL ? 'الحد الأقصى' : 'Max Level'}
                  </div>
                </Card>
              </div>
            </div>

            {/* Premium Plans */}
            <div className="p-6">
              <h3 className="text-xl font-extra-bold text-gray-800 mb-4 text-center">
                {isRTL ? 'اختر باقتك المميزة' : 'Choose Your Premium Plan'}
              </h3>

              <div className="grid gap-4">
                {premiumPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      plan.popular ? 
                      'border-purple-500 bg-purple-50 shadow-lg' : 
                      'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={onUpgrade}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          <h4 className="text-lg font-extra-bold text-gray-800">
                            {isRTL ? plan.nameAr : plan.name}
                          </h4>
                          {plan.popular && (
                            <div className="px-2 py-1 bg-purple-500 text-white text-xs font-extra-bold rounded-full">
                              {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 font-bold mb-3">
                          {isRTL ? plan.descriptionAr : plan.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-green-600">
                            <span>∞</span>
                            <span className="font-bold">{isRTL ? 'ألعاب' : 'Games'}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-blue-600">
                            <span>∞</span>
                            <span className="font-bold">{isRTL ? 'قصص' : 'Stories'}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-purple-600">
                            <span>∞</span>
                            <span className="font-bold">{isRTL ? 'مستويات' : 'Levels'}</span>
                          </div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-orange-600">
                            <span>🚫</span>
                            <span className="font-bold">{isRTL ? 'إعلانات' : 'Ads'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center ml-4 rtl:mr-4 rtl:ml-0">
                        <div className="text-3xl font-extra-bold text-gray-800">
                          ${plan.price}
                        </div>
                        <div className="text-sm font-bold text-gray-600">
                          {isRTL ? 
                            (plan.duration === 'monthly' ? 'شهرياً' : 'سنوياً') :
                            (plan.duration === 'monthly' ? 'per month' : 'per year')
                          }
                        </div>
                        {plan.discount && (
                          <div className="text-xs text-green-600 font-bold">
                            {isRTL ? `وفر ${plan.discount}%` : `Save ${plan.discount}%`}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div 
                className="mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onUpgrade}
                  className="w-full btn-fun text-white font-extra-bold py-6 text-lg"
                >
                  <Crown className="w-6 h-6 mr-3 rtl:ml-3 rtl:mr-0" />
                  <span>{isRTL ? 'ترقى الآن واستمتع بلا حدود!' : 'Upgrade Now & Enjoy Unlimited!'}</span>
                  <ArrowRight className="w-5 h-5 ml-3 rtl:mr-3 rtl:ml-0" />
                </Button>
              </motion.div>

              {/* Benefits List */}
              <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <h4 className="font-extra-bold text-gray-800 mb-3 text-center">
                  {isRTL ? 'ما ستحصل عليه:' : 'What You\'ll Get:'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { icon: '🎮', text: isRTL ? 'ألعاب لا محدودة' : 'Unlimited Games' },
                    { icon: '📚', text: isRTL ? 'جميع القصص' : 'All Stories' },
                    { icon: '🏆', text: isRTL ? 'جميع المستويات' : 'All Levels' },
                    { icon: '👥', text: isRTL ? 'ملفات متعددة' : 'Multiple Profiles' },
                    { icon: '🚫', text: isRTL ? 'بدون إعلانات' : 'No Ads' },
                    { icon: '📊', text: isRTL ? 'تقارير مفصلة' : 'Detailed Reports' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-lg">{benefit.icon}</span>
                      <span className="font-bold text-gray-700">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Later Button */}
              <div className="mt-4 text-center">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 font-bold"
                >
                  {isRTL ? 'ربما لاحقاً' : 'Maybe Later'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}