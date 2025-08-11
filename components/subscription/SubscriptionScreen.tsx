import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { 
  ArrowLeft, Check, Star, CreditCard, Shield, Clock, 
  Users, Download, BarChart3, MessageCircle, Crown,
  AlertCircle, Loader2, CheckCircle2
} from "lucide-react";
import { SUBSCRIPTION_PLANS, PAYMENT_METHODS, SubscriptionPlan, PaymentMethod, BillingInfo } from "../../types/Subscription";
import { subscriptionService } from "../../services/SubscriptionService";
import { User } from "../../types/Auth";

interface SubscriptionScreenProps {
  user: User;
  onBack: () => void;
  onSubscriptionComplete: () => void;
  isRTL: boolean;
}

type SubscriptionStep = 'plans' | 'billing' | 'payment' | 'processing' | 'success';

export function SubscriptionScreen({ user, onBack, onSubscriptionComplete, isRTL }: SubscriptionScreenProps) {
  const [currentStep, setCurrentStep] = useState<SubscriptionStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    fullName: user.name || '',
    email: user.email || '',
    country: '',
    city: '',
    postalCode: '',
    address: '',
    phone: ''
  });
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // تنظيف الأخطاء عند تغيير الخطوة
  useEffect(() => {
    setError(null);
  }, [currentStep]);

  // معالج اختيار الباقة
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('billing');
  };

  // معالج تحديث معلومات الفواتير
  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  // معالج تحديث معلومات البطاقة
  const handleCardChange = (field: string, value: string) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  // التحقق من صحة معلومات الفواتير
  const validateBillingInfo = (): boolean => {
    const required = ['fullName', 'email', 'country', 'city', 'address'];
    return required.every(field => billingInfo[field as keyof BillingInfo]?.trim());
  };

  // التحقق من صحة معلومات البطاقة
  const validateCardInfo = (): boolean => {
    if (selectedPaymentMethod?.type !== 'credit_card') return true;
    
    const { cardNumber, expiryMonth, expiryYear, cvv, holderName } = cardInfo;
    return !!(cardNumber && expiryMonth && expiryYear && cvv && holderName);
  };

  // معالج الانتقال للدفع
  const handleProceedToPayment = () => {
    if (!validateBillingInfo()) {
      setError(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setCurrentStep('payment');
  };

  // معالج إتمام الاشتراك
  const handleCompleteSubscription = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return;

    if (!validateCardInfo()) {
      setError(isRTL ? 'يرجى إدخال معلومات البطاقة كاملة' : 'Please enter complete card information');
      return;
    }

    if (!acceptTerms) {
      setError(isRTL ? 'يرجى قبول الشروط والأحكام' : 'Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    setError(null);

    try {
      // إضافة معلومات البطاقة لطريقة الدفع إذا كانت بطاقة ائتمان
      const paymentMethodWithDetails = {
        ...selectedPaymentMethod,
        ...(selectedPaymentMethod.type === 'credit_card' && {
          lastFour: cardInfo.cardNumber.slice(-4),
          expiryMonth: parseInt(cardInfo.expiryMonth),
          expiryYear: parseInt(cardInfo.expiryYear),
          brand: getCardBrand(cardInfo.cardNumber)
        })
      };

      const result = await subscriptionService.createSubscription(
        user.id,
        selectedPlan.id,
        paymentMethodWithDetails,
        billingInfo
      );

      if (result.success) {
        setSuccess(true);
        setCurrentStep('success');
        
        // انتظار قليل ثم إتمام العملية
        setTimeout(() => {
          onSubscriptionComplete();
        }, 3000);
      } else {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      setCurrentStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // تحديد نوع البطاقة
  const getCardBrand = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Unknown';
  };

  // عرض خطوة اختيار الباقة
  const renderPlanSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* العنوان */}
      <div className="text-center">
        <h1 className="text-4xl font-extra-bold text-white text-bold-shadow mb-4">
          {isRTL ? 'اختر باقتك المثالية! 🌟' : 'Choose Your Perfect Plan! 🌟'}
        </h1>
        <p className="text-white/90 text-xl font-bold">
          {isRTL 
            ? 'استمتع بتجربة تعليمية لا محدودة لأطفالك'
            : 'Enjoy unlimited educational experience for your children'
          }
        </p>
      </div>

      {/* الباقات */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isRTL={isRTL}
            isPopular={plan.popular}
            onSelect={() => handlePlanSelect(plan)}
            animationDelay={index * 0.2}
          />
        ))}
      </div>

      {/* المميزات المشتركة */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-extra-bold text-white text-center mb-6">
          {isRTL ? 'جميع الباقات تشمل:' : 'All Plans Include:'}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: '📚', text: isRTL ? 'أكثر من 200 قصة تفاعلية' : '200+ Interactive Stories' },
            { icon: '🎮', text: isRTL ? '20 لعبة تعليمية متقدمة' : '20 Advanced Educational Games' },
            { icon: '👥', text: isRTL ? 'ملفات أطفال غير محدودة' : 'Unlimited Children Profiles' },
            { icon: '📱', text: isRTL ? 'تطبيق متجاوب لجميع الأجهزة' : 'Responsive App for All Devices' },
            { icon: '🌐', text: isRTL ? 'دعم اللغة العربية والإنجليزية' : 'Arabic & English Support' },
            { icon: '🛡️', text: isRTL ? 'بيئة آمنة للأطفال' : 'Safe Environment for Kids' },
            { icon: '📊', text: isRTL ? 'تقارير تقدم مفصلة' : 'Detailed Progress Reports' },
            { icon: '🎵', text: isRTL ? 'تجربة خالية من الإعلانات' : 'Ad-Free Experience' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + (index * 0.1) }}
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <div className="text-2xl">{feature.icon}</div>
              <span className="text-white font-bold">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // عرض خطوة معلومات الفواتير
  const renderBillingInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-extra-bold text-gray-800 text-center mb-6">
          {isRTL ? 'معلومات الفواتير' : 'Billing Information'}
        </h2>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="font-extra-bold">{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input
                value={billingInfo.fullName}
                onChange={(e) => handleBillingChange('fullName', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>
            <div>
              <Label className="font-extra-bold">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleBillingChange('email', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="font-extra-bold">{isRTL ? 'الدولة' : 'Country'}</Label>
              <Select onValueChange={(value) => handleBillingChange('country', value)}>
                <SelectTrigger className="font-bold">
                  <SelectValue placeholder={isRTL ? 'اختر الدولة' : 'Select Country'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="SA">Saudi Arabia</SelectItem>
                  <SelectItem value="AE">UAE</SelectItem>
                  <SelectItem value="EG">Egypt</SelectItem>
                  <SelectItem value="JO">Jordan</SelectItem>
                  <SelectItem value="LB">Lebanon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-extra-bold">{isRTL ? 'المدينة' : 'City'}</Label>
              <Input
                value={billingInfo.city}
                onChange={(e) => handleBillingChange('city', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'أدخل المدينة' : 'Enter city'}
              />
            </div>
          </div>

          <div>
            <Label className="font-extra-bold">{isRTL ? 'العنوان' : 'Address'}</Label>
            <Input
              value={billingInfo.address}
              onChange={(e) => handleBillingChange('address', e.target.value)}
              className="font-bold"
              placeholder={isRTL ? 'أدخل العنوان الكامل' : 'Enter full address'}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="font-extra-bold">{isRTL ? 'الرمز البريدي' : 'Postal Code'}</Label>
              <Input
                value={billingInfo.postalCode}
                onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'أدخل الرمز البريدي' : 'Enter postal code'}
              />
            </div>
            <div>
              <Label className="font-extra-bold">{isRTL ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}</Label>
              <Input
                value={billingInfo.phone}
                onChange={(e) => handleBillingChange('phone', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-200 rounded-xl flex items-center space-x-3 rtl:space-x-reverse">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-bold">{error}</span>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setCurrentStep('plans')}
            variant="outline"
            className="btn-clear font-extra-bold"
          >
            {isRTL ? 'السابق' : 'Previous'}
          </Button>
          <Button
            onClick={handleProceedToPayment}
            className="btn-fun text-white font-extra-bold"
          >
            {isRTL ? 'المتابعة للدفع' : 'Continue to Payment'}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // عرض خطوة اختيار طريقة الدفع
  const renderPaymentMethod = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-extra-bold text-gray-800 text-center mb-6">
          {isRTL ? 'طريقة الدفع' : 'Payment Method'}
        </h2>

        {/* ملخص الباقة */}
        {selectedPlan && (
          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extra-bold text-gray-800">
                  {isRTL ? selectedPlan.nameAr : selectedPlan.name}
                </h3>
                <p className="text-gray-600 font-bold">
                  {isRTL ? selectedPlan.descriptionAr : selectedPlan.description}
                </p>
              </div>
              <div className="text-right rtl:text-left">
                <div className="text-3xl font-extra-bold text-blue-600">
                  ${selectedPlan.price}
                </div>
                <div className="text-sm font-bold text-gray-600">
                  {isRTL ? 
                    (selectedPlan.duration === 'monthly' ? 'شهرياً' : 'سنوياً') :
                    (selectedPlan.duration === 'monthly' ? 'per month' : 'per year')
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* طرق الدفع */}
        <div className="space-y-4 mb-6">
          <Label className="font-extra-bold text-gray-800">
            {isRTL ? 'اختر طريقة الدفع:' : 'Choose Payment Method:'}
          </Label>
          <div className="grid gap-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.type}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPaymentMethod?.type === method.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod(method)}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="text-2xl">{method.icon}</div>
                  <span className="font-bold text-gray-800">
                    {isRTL ? method.displayNameAr : method.displayName}
                  </span>
                  {selectedPaymentMethod?.type === method.type && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto rtl:mr-auto rtl:ml-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معلومات البطاقة */}
        {selectedPaymentMethod?.type === 'credit_card' && (
          <div className="space-y-4 mb-6">
            <div>
              <Label className="font-extra-bold">{isRTL ? 'رقم البطاقة' : 'Card Number'}</Label>
              <Input
                value={cardInfo.cardNumber}
                onChange={(e) => handleCardChange('cardNumber', e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                className="font-bold"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="font-extra-bold">{isRTL ? 'الشهر' : 'Month'}</Label>
                <Select onValueChange={(value) => handleCardChange('expiryMonth', value)}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-extra-bold">{isRTL ? 'السنة' : 'Year'}</Label>
                <Select onValueChange={(value) => handleCardChange('expiryYear', value)}>
                  <SelectTrigger className="font-bold">
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString().slice(-2);
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-extra-bold">CVV</Label>
                <Input
                  value={cardInfo.cvv}
                  onChange={(e) => handleCardChange('cvv', e.target.value)}
                  className="font-bold"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <Label className="font-extra-bold">{isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}</Label>
              <Input
                value={cardInfo.holderName}
                onChange={(e) => handleCardChange('holderName', e.target.value)}
                className="font-bold"
                placeholder={isRTL ? 'الاسم كما يظهر على البطاقة' : 'Name as it appears on card'}
              />
            </div>
          </div>
        )}

        {/* قبول الشروط */}
        <div className="flex items-start space-x-3 rtl:space-x-reverse mb-6">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm font-bold text-gray-700 cursor-pointer">
            {isRTL 
              ? 'أوافق على الشروط والأحكام وسياسة الخصوصية'
              : 'I agree to the Terms & Conditions and Privacy Policy'
            }
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl flex items-center space-x-3 rtl:space-x-reverse">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-bold">{error}</span>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentStep('billing')}
            variant="outline"
            className="btn-clear font-extra-bold"
          >
            {isRTL ? 'السابق' : 'Previous'}
          </Button>
          <Button
            onClick={handleCompleteSubscription}
            disabled={!selectedPaymentMethod || !acceptTerms}
            className="btn-fun text-white font-extra-bold"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {isRTL ? `ادفع $${selectedPlan?.price}` : `Pay $${selectedPlan?.price}`}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // عرض خطوة المعالجة
  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-xl max-w-md mx-auto">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
        </div>
        <h2 className="text-2xl font-extra-bold text-gray-800 mb-4">
          {isRTL ? 'جاري معالجة الدفع...' : 'Processing Payment...'}
        </h2>
        <p className="text-gray-600 font-bold">
          {isRTL 
            ? 'يرجى الانتظار، نحن نعالج عملية الدفع بأمان'
            : 'Please wait, we are securely processing your payment'
          }
        </p>
      </div>
    </motion.div>
  );

  // عرض خطوة النجاح
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-xl max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-extra-bold text-gray-800 mb-4">
          {isRTL ? 'تم الاشتراك بنجاح! 🎉' : 'Subscription Successful! 🎉'}
        </h2>
        
        <p className="text-gray-600 font-bold mb-6">
          {isRTL 
            ? 'مرحباً بك في عالم سكيلو! استمتع بتجربة التعلم اللا محدودة'
            : 'Welcome to Skilloo! Enjoy your unlimited learning experience'
          }
        </p>

        <div className="text-sm text-gray-500 font-bold">
          {isRTL ? 'سيتم توجيهك للتطبيق خلال ثوان...' : 'Redirecting to app in a few seconds...'}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 ${isRTL ? 'rtl' : ''}`}>
      <div className="container-responsive py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 safe-area-top"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/20 p-3 rounded-xl font-bold"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-white text-2xl font-extra-bold text-bold-shadow">
              {isRTL ? "اشتراك سكيلو" : "Skilloo Subscription"}
            </h1>
          </div>
          
          <div className="w-12" />
        </motion.div>

        {/* شريط التقدم */}
        {currentStep !== 'processing' && currentStep !== 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <div className="flex items-center justify-between">
                {['plans', 'billing', 'payment'].map((step, index) => {
                  const isActive = currentStep === step;
                  const isCompleted = ['plans', 'billing', 'payment'].indexOf(currentStep) > index;
                  
                  return (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive || isCompleted
                          ? 'bg-white text-purple-600'
                          : 'bg-white/30 text-white'
                      } font-extra-bold transition-all duration-300`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* المحتوى */}
        <AnimatePresence mode="wait">
          {currentStep === 'plans' && renderPlanSelection()}
          {currentStep === 'billing' && renderBillingInfo()}
          {currentStep === 'payment' && renderPaymentMethod()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'success' && renderSuccess()}
        </AnimatePresence>
      </div>
    </div>
  );
}

// مكون بطاقة الباقة
interface PlanCardProps {
  plan: SubscriptionPlan;
  isRTL: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  animationDelay: number;
}

function PlanCard({ plan, isRTL, isPopular, onSelect, animationDelay }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative ${isPopular ? 'order-first md:order-none' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-extra-bold text-sm shadow-lg z-10">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Star className="w-4 h-4" />
            <span>{isRTL ? 'الأكثر شعبية' : 'Most Popular'}</span>
          </div>
        </div>
      )}
      
      <Card className={`p-8 h-full bg-white/95 backdrop-blur-sm border-2 ${
        isPopular ? 'border-yellow-400 shadow-2xl' : 'border-white/60 shadow-lg'
      } rounded-3xl transition-all duration-300 hover:shadow-2xl`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-extra-bold text-gray-800 mb-2">
            {isRTL ? plan.nameAr : plan.name}
          </h3>
          <p className="text-gray-600 font-bold">
            {isRTL ? plan.descriptionAr : plan.description}
          </p>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center space-x-1 rtl:space-x-reverse">
            <span className="text-5xl font-extra-bold text-gray-800">${plan.price}</span>
            <span className="text-gray-600 font-bold">
              /{isRTL ? (plan.duration === 'monthly' ? 'شهر' : 'سنة') : (plan.duration === 'monthly' ? 'month' : 'year')}
            </span>
          </div>
          
          {plan.discount && plan.originalPrice && (
            <div className="mt-2">
              <span className="text-gray-500 line-through font-bold">${plan.originalPrice}</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-extra-bold">
                {plan.discount}% {isRTL ? 'خصم' : 'OFF'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {(isRTL ? plan.featuresAr : plan.features).map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700 font-bold">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={onSelect}
          className={`w-full btn-fun text-white font-extra-bold py-4 ${
            isPopular ? 'shadow-xl' : ''
          }`}
        >
          {isRTL ? 'اختر هذه الباقة' : 'Choose This Plan'}
        </Button>
      </Card>
    </motion.div>
  );
}