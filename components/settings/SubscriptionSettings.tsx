import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  Crown, Calendar, CreditCard, AlertTriangle, CheckCircle2, 
  Clock, DollarSign, RefreshCw, X, Star, Shield, Zap
} from "lucide-react";
import { subscriptionService } from "../../services/SubscriptionService";
import { SubscriptionState, Payment } from "../../types/Subscription";
import { User } from "../../types/Auth";

interface SubscriptionSettingsProps {
  user: User;
  isRTL: boolean;
  onUpgrade?: () => void;
}

export function SubscriptionSettings({ user, isRTL, onUpgrade }: SubscriptionSettingsProps) {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(
    subscriptionService.getSubscriptionState()
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // تحديث حالة الاشتراك
  useEffect(() => {
    const unsubscribe = subscriptionService.subscribe((newState) => {
      setSubscriptionState(newState);
    });

    // تحميل سجل المدفوعات
    const userPayments = subscriptionService.getUserPayments(user.id);
    setPayments(userPayments);

    return unsubscribe;
  }, [user.id]);

  // تجديد الاشتراك
  const handleRenewSubscription = async () => {
    if (!subscriptionState.currentSubscription) return;
    
    setIsLoading(true);
    try {
      const result = await subscriptionService.renewSubscription(
        subscriptionState.currentSubscription.id
      );
      
      if (!result.success) {
        console.error('Failed to renew subscription:', result.error);
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // إلغاء الاشتراك
  const handleCancelSubscription = async () => {
    if (!subscriptionState.currentSubscription) return;
    
    setIsLoading(true);
    try {
      const result = await subscriptionService.cancelSubscription(
        subscriptionState.currentSubscription.id,
        cancelReason
      );
      
      if (result.success) {
        setShowCancelDialog(false);
        setCancelReason('');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حساب نسبة التقدم للفترة المتبقية
  const getProgressPercentage = (): number => {
    if (!subscriptionState.currentSubscription || !subscriptionState.activePlan) return 0;
    
    const totalDays = subscriptionState.activePlan.durationMonths * 30;
    const remainingDays = subscriptionState.daysRemaining;
    const usedDays = totalDays - remainingDays;
    
    return Math.max(0, Math.min(100, (usedDays / totalDays) * 100));
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // حالة الاشتراك
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      active: { ar: 'نشط', en: 'Active' },
      expired: { ar: 'منتهي', en: 'Expired' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
      pending: { ar: 'معلق', en: 'Pending' }
    };
    return isRTL ? statusMap[status]?.ar || status : statusMap[status]?.en || status;
  };

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Crown className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-extra-bold text-gray-800">
          {isRTL ? 'إدارة الاشتراك' : 'Subscription Management'}
        </h2>
      </div>

      {/* معلومات الاشتراك الحالي */}
      <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extra-bold text-gray-800">
                {subscriptionState.activePlan ? 
                  (isRTL ? subscriptionState.activePlan.nameAr : subscriptionState.activePlan.name) :
                  (isRTL ? 'لا يوجد اشتراك' : 'No Subscription')
                }
              </h3>
              <p className="text-gray-600 font-bold">
                {subscriptionState.activePlan ?
                  (isRTL ? subscriptionState.activePlan.descriptionAr : subscriptionState.activePlan.description) :
                  (isRTL ? 'لم تشترك بعد في أي باقة' : 'You haven\'t subscribed to any plan yet')
                }
              </p>
            </div>
          </div>
          
          {subscriptionState.currentSubscription && (
            <Badge className={`px-3 py-1 font-extra-bold border ${getStatusColor(subscriptionState.currentSubscription.status)}`}>
              {getStatusText(subscriptionState.currentSubscription.status)}
            </Badge>
          )}
        </div>

        {subscriptionState.isSubscribed && subscriptionState.currentSubscription && subscriptionState.activePlan ? (
          <>
            {/* معلومات الفترة المتبقية */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-white rounded-2xl border border-purple-200">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-extra-bold text-gray-800">
                  {subscriptionState.daysRemaining}
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {isRTL ? 'يوم متبقي' : 'Days Left'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-2xl border border-purple-200">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-extra-bold text-gray-800">
                  ${subscriptionState.activePlan.price}
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {isRTL ? 
                    (subscriptionState.activePlan.duration === 'monthly' ? 'شهرياً' : 'سنوياً') :
                    (subscriptionState.activePlan.duration === 'monthly' ? 'Monthly' : 'Yearly')
                  }
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-2xl border border-purple-200">
                <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-extra-bold text-gray-800">
                  {subscriptionState.currentSubscription.autoRenew ? 
                    (isRTL ? 'نعم' : 'Yes') : 
                    (isRTL ? 'لا' : 'No')
                  }
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {isRTL ? 'التجديد التلقائي' : 'Auto Renew'}
                </div>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">
                  {isRTL ? 'فترة الاشتراك' : 'Subscription Period'}
                </span>
                <span className="font-bold text-gray-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between mt-2 text-sm font-bold text-gray-600">
                <span>{formatDate(subscriptionState.currentSubscription.startDate)}</span>
                <span>{formatDate(subscriptionState.currentSubscription.endDate)}</span>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-wrap gap-3">
              {subscriptionState.currentSubscription.status === 'active' && (
                <>
                  <Button
                    onClick={handleRenewSubscription}
                    disabled={isLoading}
                    className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 hover:bg-green-700 text-white font-extra-bold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{isRTL ? 'تجديد مبكر' : 'Renew Early'}</span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    className="flex items-center space-x-2 rtl:space-x-reverse border-red-200 text-red-600 hover:bg-red-50 font-extra-bold"
                  >
                    <X className="w-4 h-4" />
                    <span>{isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}</span>
                  </Button>
                </>
              )}
              
              {subscriptionState.activePlan.duration === 'monthly' && (
                <Button
                  onClick={onUpgrade}
                  className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extra-bold"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isRTL ? 'ترقية للباقة السنوية' : 'Upgrade to Yearly'}</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          // عرض للمستخدمين غير المشتركين
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-extra-bold text-gray-800 mb-2">
              {isRTL ? 'ابدأ اشتراكك الآن!' : 'Start Your Subscription Now!'}
            </h3>
            <p className="text-gray-600 font-bold mb-6">
              {isRTL 
                ? 'استمتع بجميع المميزات والمحتوى التعليمي المتقدم'
                : 'Enjoy all features and premium educational content'
              }
            </p>
            <Button
              onClick={onUpgrade}
              className="btn-fun text-white font-extra-bold"
            >
              {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
            </Button>
          </div>
        )}
      </Card>

      {/* الميزات المشمولة */}
      {subscriptionState.activePlan && (
        <Card className="p-6">
          <h3 className="text-xl font-extra-bold text-gray-800 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>{isRTL ? 'الميزات المشمولة' : 'Included Features'}</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {(isRTL ? subscriptionState.activePlan.featuresAr : subscriptionState.activePlan.features).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-bold text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* سجل المدفوعات */}
      {payments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-extra-bold text-gray-800 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>{isRTL ? 'سجل المدفوعات' : 'Payment History'}</span>
          </h3>
          
          <div className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-extra-bold text-gray-800">
                      ${payment.amount} {payment.currency}
                    </div>
                    <div className="text-sm font-bold text-gray-600">
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                </div>
                
                <Badge className={`font-extra-bold ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* حوار إلغاء الاشتراك */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-extra-bold text-gray-800 mb-2">
                  {isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                </h3>
                <p className="text-gray-600 font-bold">
                  {isRTL 
                    ? 'هل أنت متأكد من رغبتك في إلغاء اشتراكك؟'
                    : 'Are you sure you want to cancel your subscription?'
                  }
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-extra-bold text-gray-700 mb-2">
                  {isRTL ? 'سبب الإلغاء (اختياري):' : 'Reason for cancellation (optional):'}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold"
                  rows={3}
                  placeholder={isRTL ? 'أخبرنا سبب إلغاء الاشتراك...' : 'Tell us why you\'re cancelling...'}
                />
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1 font-extra-bold"
                  disabled={isLoading}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extra-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancel'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}