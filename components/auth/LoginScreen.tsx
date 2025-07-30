import { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { LanguageToggle } from "../ui/language-toggle";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Heart, Globe } from "lucide-react";
import { authService } from "../../services/AuthService";

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

export function LoginScreen({
  onLoginSuccess,
  onSwitchToSignup,
  onForgotPassword,
  onBack,
  isRTL,
  onLanguageChange,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const validateForm = useCallback(() => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = isRTL ? "الإيميل مطلوب" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = isRTL ? "الإيميل غير صحيح" : "Invalid email format";
    }

    if (!password) {
      newErrors.password = isRTL ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (password.length < 6) {
      newErrors.password = isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, isRTL]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (isLoading) {
      console.log('⏳ Login already in progress, ignoring click');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('🔐 Starting login process...');
    setIsLoading(true);
    setErrors({});
    setLoadingStep(isRTL ? 'جاري التحقق من البيانات...' : 'Validating credentials...');

    try {
      console.log('🔐 Attempting login with:', { email: email.trim(), password: '***' });
      
      setLoadingStep(isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...');
      const result = await authService.login(email.trim(), password);
      
      if (result.success) {
        console.log('✅ Login successful:', result.user);
        setLoadingStep(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        // تأخير قصير لإظهار رسالة النجاح
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        console.log('❌ Login failed:', result.error);
        setErrors({
          general: result.error || (isRTL ? "خطأ في تسجيل الدخول" : "Login failed")
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({
        general: isRTL ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login"
      });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [email, password, isLoading, validateForm, onLoginSuccess, isRTL]);

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
            {isRTL ? "أهلاً بعودتك!" : "Welcome Back!"}
          </h1>
          <p 
            className="text-white/90 font-bold text-clear" 
            style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#ffffff !important'
            }}
          >
            {isRTL ? "سجل دخولك للمتابعة" : "Sign in to continue"}
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-professional p-8 border-2 border-white/30 backdrop-blur-md bg-white/95" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="text-center mb-6">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              <h2 
                className="text-ultra-clear font-ultra-bold mb-2" 
                style={{ 
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  color: '#000000 !important'
                }}
              >
                {isRTL ? "تسجيل الدخول" : "Sign In"}
              </h2>
              <p className="text-clear" style={{ color: '#000000 !important' }}>
                {isRTL ? "أدخل بياناتك للدخول" : "Enter your credentials to sign in"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-clear font-bold" 
                  style={{ color: '#000000 !important' }}
                >
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
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

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-bold text-center" style={{ color: '#dc2626 !important' }}>
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading}
                style={{ 
                  color: '#ffffff !important',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
                }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span style={{ color: '#ffffff !important' }} className="text-sm">
                      {loadingStep || (isRTL ? "جاري تسجيل الدخول..." : "Signing in...")}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: '#ffffff !important' }}>
                    {isRTL ? "تسجيل الدخول" : "Sign In"}
                  </span>
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={onForgotPassword}
                  className="text-sm p-0 h-auto font-normal hover:underline"
                  style={{ color: '#3b82f6 !important' }}
                  disabled={isLoading}
                >
                  {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </Button>
              </div>

              {/* Switch to Signup */}
              <div className="text-center">
                <p className="text-clear mb-2" style={{ color: '#000000 !important' }}>
                  {isRTL ? "ليس لديك حساب؟" : "Don't have an account?"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSwitchToSignup}
                  className="w-full font-bold border-2 bg-white hover:bg-gray-50"
                  style={{ 
                    color: '#000000 !important',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#d1d5db'
                  }}
                  disabled={isLoading}
                >
                  <span style={{ color: '#000000 !important' }}>
                    {isRTL ? "إنشاء حساب جديد" : "Create New Account"}
                  </span>
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}