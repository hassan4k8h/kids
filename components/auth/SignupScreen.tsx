import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import { LanguageToggle } from "../ui/language-toggle";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Sparkles,
  Gift,
  Star,
  UserPlus,
  LogIn,
  Globe
} from "lucide-react";
import { authService } from "../../services/AuthService";

interface SignupScreenProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

export function SignupScreen({ 
  onSignupSuccess, 
  onSwitchToLogin, 
  onBack, 
  isRTL, 
  onLanguageChange 
}: SignupScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentEmail: '',
    acceptTerms: false,
    isChildAccount: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = isRTL ? "الاسم يجب أن يكون حرفين على الأقل" : "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = isRTL ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = isRTL ? "تأكيد كلمة المرور مطلوب" : "Password confirmation is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? "كلمات المرور غير متطابقة" : "Passwords don't match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = isRTL ? "يجب الموافقة على الشروط والأحكام" : "You must accept terms and conditions";
    }

    if (formData.isChildAccount && !formData.parentEmail.trim()) {
      newErrors.parentEmail = isRTL ? "بريد ولي الأمر مطلوب للحسابات الخاصة بالأطفال" : "Parent email is required for child accounts";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isRTL]);

  const handleSignup = useCallback(async () => {
    if (!validateForm()) return;
    
    // Prevent double submission
    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('👤 Attempting signup with:', {
        name: formData.name,
        email: formData.email,
        password: '***'
      });

      const result = await authService.signup(
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      );

      if (result.success) {
        console.log('✅ Signup successful:', result.user);
        setSuccess(isRTL ? 'تم إنشاء الحساب بنجاح! مرحباً بك في سكيلو!' : 'Account created successfully! Welcome to Skilloo!');
        
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      } else {
        console.log('❌ Signup failed:', result.error);
        setErrors({
          general: result.error || (isRTL ? 'فشل في إنشاء الحساب' : 'Failed to create account')
        });
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setErrors({
        general: isRTL ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred while creating account'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, validateForm, onSignupSuccess, isRTL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300/15 rounded-full blur-lg animate-bounce"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full p-3"
          >
            <ArrowLeft className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageToggle
              isRTL={isRTL}
              onToggle={onLanguageChange}
              className="text-white"
            />
            <Globe className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="text-white font-ultra-bold text-super-clear mb-2" 
            style={{ 
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              color: '#ffffff !important'
            }}
          >
            {isRTL ? "انضم إلينا!" : "Join Us!"}
          </h1>
          <p 
            className="text-white/90 font-bold text-clear" 
            style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#ffffff !important'
            }}
          >
            {isRTL ? "أنشئ حساباً وابدأ التعلم" : "Create an account and start learning"}
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-professional p-8 border-2 border-white/30 backdrop-blur-md bg-white/95" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="text-center mb-6">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>
              <h2 
                className="text-ultra-clear font-ultra-bold mb-2" 
                style={{ 
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  color: '#000000 !important'
                }}
              >
                {isRTL ? "ابدأ رحلتك مع سكيلو!" : "Start Your Skilloo Journey!"}
              </h2>
              <p className="text-clear" style={{ color: '#000000 !important' }}>
                {isRTL ? "أنشئ حساباً وابدأ التعلم بطريقة ممتعة" : "Create an account and start learning with fun"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL ? "الاسم الكامل" : "Full Name"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                    className="input-professional pl-10 pr-4"
                    style={{ 
                      color: '#000000 !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm font-bold" style={{ color: '#dc2626 !important' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL ? "البريد الإلكتروني" : "Email Address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                    className="input-professional pl-10 pr-4"
                    style={{ 
                      color: '#000000 !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm font-bold" style={{ color: '#dc2626 !important' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL ? "كلمة المرور" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isRTL ? "أدخل كلمة المرور (6 أحرف على الأقل)" : "Enter password (6+ characters)"}
                    className="input-professional pl-10 pr-12"
                    style={{ 
                      color: '#000000 !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm font-bold" style={{ color: '#dc2626 !important' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword" 
                  className="text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter your password"}
                    className="input-professional pl-10 pr-12"
                    style={{ 
                      color: '#000000 !important',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm font-bold" style={{ color: '#dc2626 !important' }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked === true)}
                  disabled={isLoading}
                  className="mt-1 border-2 border-purple-300"
                />
                <Label 
                  htmlFor="acceptTerms" 
                  className="text-sm cursor-pointer leading-relaxed text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL 
                    ? "أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة بسكيلو"
                    : "I agree to Skilloo's Terms and Conditions and Privacy Policy"
                  }
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm font-bold" style={{ color: '#dc2626 !important' }}>
                  {errors.acceptTerms}
                </p>
              )}

              {/* General Error */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 font-bold text-clear">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 font-bold text-clear">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Signup Button */}
              <Button
                onClick={handleSignup}
                disabled={isLoading || !formData.acceptTerms}
                className="btn-primary w-full"
                style={{ 
                  color: '#ffffff !important',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span style={{ color: '#ffffff !important' }}>
                      {isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <UserPlus className="w-5 h-5" />
                    <span style={{ color: '#ffffff !important' }}>
                      {isRTL ? "إنشاء الحساب" : "Create Account"}
                    </span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Features Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h3 className="font-bold mb-2 flex items-center text-clear" style={{ color: '#000000 !important' }}>
                  <Star className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-yellow-500" />
                  {isRTL ? "ما ستحصل عليه:" : "What you'll get:"}
                </h3>
                <ul className="text-sm space-y-1 font-bold text-clear" style={{ color: '#000000 !important' }}>
                  <li>• {isRTL ? "ألعاب تعليمية تفاعلية" : "Interactive educational games"}</li>
                  <li>• {isRTL ? "قصص مخصصة لطفلك" : "Personalized stories for your child"}</li>
                  <li>• {isRTL ? "تتبع التقدم والإنجازات" : "Progress tracking and achievements"}</li>
                  <li>• {isRTL ? "محتوى آمن ومناسب للأطفال" : "Safe and kid-friendly content"}</li>
                </ul>
              </div>

              {/* Switch to Login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-clear mb-2" style={{ color: '#000000 !important' }}>
                  {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}
                </p>
                <Button
                  onClick={onSwitchToLogin}
                  variant="outline"
                  className="w-full font-bold border-2 bg-white hover:bg-gray-50"
                  style={{ 
                    color: '#000000 !important',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#d1d5db'
                  }}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <LogIn className="w-5 h-5" />
                    <span style={{ color: '#000000 !important' }}>
                      {isRTL ? "تسجيل الدخول" : "Sign In"}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}