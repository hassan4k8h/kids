import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, ArrowRight, Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, Shield, Key, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/AuthService';

interface ResetPasswordScreenProps {
  onBack: () => void;
  onResetComplete: () => void;
  verificationCode?: string;
  userEmail?: string;
  isRTL: boolean;
  onLanguageChange: (isRTL: boolean) => void;
}

export function ResetPasswordScreen({
  onBack,
  onResetComplete,
  verificationCode,
  userEmail,
  isRTL,
  onLanguageChange
}: ResetPasswordScreenProps) {
  const [formData, setFormData] = useState({
    verificationCode: verificationCode || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // التحقق من صحة كود التوثيق عند تحميل الصفحة
  useEffect(() => {
    if (formData.verificationCode) {
      validateVerificationCode(formData.verificationCode);
    }
  }, [formData.verificationCode]);

  const validateVerificationCode = async (code: string) => {
    try {
      console.log('🔍 Validating verification code:', code);
      
      // استدعاء AuthService للتحقق من صحة كود التوثيق
      const result = await authService.validateVerificationCode(code, userEmail || '');
      
      if (result.valid && !result.expired) {
        setTokenValid(true);
        console.log('✅ Verification code is valid');
      } else {
        setTokenValid(false);
        setErrors({
          verificationCode: isRTL 
            ? 'كود التوثيق غير صالح أو منتهي الصلاحية'
            : 'Invalid or expired verification code'
        });
      }
    } catch (error) {
      console.error('❌ Verification code validation error:', error);
      setTokenValid(false);
      setErrors({
        verificationCode: isRTL 
          ? 'حدث خطأ أثناء التحقق من كود التوثيق'
          : 'Error occurred while validating verification code'
      });
    }
  };

  const validatePassword = useCallback((password: string): string[] => {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push(isRTL ? 'يجب أن تحتوي على 8 أحرف على الأقل' : 'At least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push(isRTL ? 'حرف كبير واحد على الأقل' : 'At least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push(isRTL ? 'حرف صغير واحد على الأقل' : 'At least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      issues.push(isRTL ? 'رقم واحد على الأقل' : 'At least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push(isRTL ? 'رمز خاص واحد على الأقل' : 'At least one special character');
    }
    
    return issues;
  }, [isRTL]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // التحقق من كود التوثيق
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = isRTL ? 'يرجى إدخال كود التوثيق' : 'Please enter the verification code';
    } else if (!/^\d{6}$/.test(formData.verificationCode.trim())) {
      newErrors.verificationCode = isRTL ? 'كود التوثيق يجب أن يكون 6 أرقام' : 'Verification code must be 6 digits';
    }

    // التحقق من كلمة المرور الجديدة
    if (!formData.newPassword) {
      newErrors.newPassword = isRTL ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter new password';
    } else {
      const passwordIssues = validatePassword(formData.newPassword);
      if (passwordIssues.length > 0) {
        newErrors.newPassword = passwordIssues.join(isRTL ? '، ' : ', ');
      }
    }

    // التحقق من تأكيد كلمة المرور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'يرجى تأكيد كلمة المرور' : 'Please confirm password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePassword, isRTL]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      console.log('🔐 Resetting password with verification code:', formData.verificationCode);
      
      // استدعاء AuthService لإعادة تعيين كلمة المرور باستخدام كود التوثيق
      const result = await authService.resetPasswordWithCode(formData.verificationCode, userEmail || '', formData.newPassword);
      
      if (result.success) {
        setSuccess(
          result.message || (isRTL 
            ? 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'Password reset successfully! You can now login with your new password.')
        );
        
        setTimeout(() => {
          onResetComplete();
        }, 3000);
      } else {
        setErrors({
          general: result.error || (isRTL 
            ? 'فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'
            : 'Failed to reset password. Please try again.')
        });
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setErrors({
        general: isRTL 
          ? 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
          : 'An error occurred while resetting password'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, validateForm, onResetComplete, isRTL]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // إزالة الخطأ عند بدء الكتابة
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string): { strength: number; color: string; text: string } => {
    const issues = validatePassword(password);
    const strength = Math.max(0, 5 - issues.length);
    
    if (strength === 0) return { strength: 0, color: 'bg-red-500', text: isRTL ? 'ضعيف جداً' : 'Very Weak' };
    if (strength <= 2) return { strength: strength * 20, color: 'bg-red-400', text: isRTL ? 'ضعيف' : 'Weak' };
    if (strength <= 3) return { strength: strength * 20, color: 'bg-yellow-400', text: isRTL ? 'متوسط' : 'Medium' };
    if (strength <= 4) return { strength: strength * 20, color: 'bg-blue-400', text: isRTL ? 'قوي' : 'Strong' };
    return { strength: 100, color: 'bg-green-500', text: isRTL ? 'قوي جداً' : 'Very Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // إذا كان الرمز المميز غير صالح
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isRTL ? '❌ رمز غير صالح' : '❌ Invalid Token'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isRTL 
                ? 'كود التوثيق غير صالح أو منتهي الصلاحية. يرجى طلب كود جديد.'
                : 'The verification code is invalid or expired. Please request a new code.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onBack}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              {isRTL ? 'طلب كود جديد' : 'Request New Code'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        {onLanguageChange && (
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-1">
              <Button
                variant={isRTL ? "default" : "ghost"}
                size="sm"
                onClick={() => onLanguageChange(true)}
                className="rounded-full px-4"
              >
                العربية
              </Button>
              <Button
                variant={!isRTL ? "default" : "ghost"}
                size="sm"
                onClick={() => onLanguageChange(false)}
                className="rounded-full px-4"
              >
                English
              </Button>
            </div>
          </div>
        )}

        <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isRTL ? '🔑 إعادة تعيين كلمة المرور' : '🔑 Reset Password'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {userEmail && (
                <span className="block mb-2 font-medium text-blue-600">
                  {userEmail}
                </span>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-blue-800 text-sm font-medium">
                  {isRTL 
                    ? '📧 تم إرسال كود التوثيق إلى بريدك الإلكتروني'
                    : '📧 Verification code has been sent to your email'
                  }
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  {isRTL 
                    ? 'يرجى التحقق من بريدك الإلكتروني وإدخال الكود المكون من 6 أرقام'
                    : 'Please check your email and enter the 6-digit code'
                  }
                </p>
              </div>
              {isRTL 
                ? 'أدخل كود التوثيق وكلمة المرور الجديدة لحسابك'
                : 'Enter the verification code and your new password for your account'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Verification Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'كود التوثيق' : 'Verification Code'}
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={isRTL ? 'أدخل كود التوثيق المكون من 6 أرقام...' : 'Enter 6-digit verification code...'}
                    value={formData.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      handleInputChange('verificationCode', value);
                    }}
                    className="pl-10 h-12 border-2 focus:border-green-500 transition-colors text-center text-2xl font-mono tracking-widest"
                    disabled={isLoading}
                    maxLength={6}
                    required
                  />
                </div>
                {errors.verificationCode && (
                  <p className="text-red-600 text-sm">{errors.verificationCode}</p>
                )}
                <p className="text-xs text-gray-500 text-center">
                  {isRTL 
                    ? 'أدخل الكود المكون من 6 أرقام المرسل إلى بريدك الإلكتروني'
                    : 'Enter the 6-digit code sent to your email'
                  }
                </p>
              </div>

              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? 'أدخل كلمة المرور الجديدة...' : 'Enter new password...'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="pl-10 pr-12 h-12 border-2 focus:border-green-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {isRTL ? 'قوة كلمة المرور:' : 'Password Strength:'}
                      </span>
                      <span className={`font-medium ${
                        passwordStrength.strength >= 80 ? 'text-green-600' :
                        passwordStrength.strength >= 60 ? 'text-blue-600' :
                        passwordStrength.strength >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-red-600 text-sm">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={isRTL ? 'أعد إدخال كلمة المرور...' : 'Re-enter password...'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-12 h-12 border-2 focus:border-green-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700 font-medium">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700 font-medium">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                disabled={isLoading || tokenValid === null}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    {isRTL ? 'جارٍ إعادة التعيين...' : 'Resetting...'}
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5 ml-2" />
                    {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                  </>
                )}
              </Button>
            </form>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {isRTL ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {validatePassword(formData.newPassword).map((issue, index) => (
                  <li key={index} className="flex items-center">
                    <XCircle className="w-3 h-3 ml-2 flex-shrink-0 text-red-500" />
                    {issue}
                  </li>
                ))}
                {validatePassword(formData.newPassword).length === 0 && formData.newPassword && (
                  <li className="flex items-center text-green-700">
                    <CheckCircle className="w-3 h-3 ml-2 flex-shrink-0 text-green-500" />
                    {isRTL ? 'كلمة المرور تلبي جميع المتطلبات!' : 'Password meets all requirements!'}
                  </li>
                )}
              </ul>
            </div>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              {isRTL ? (
                <>
                  <ArrowRight className="w-5 h-5 ml-2" />
                  العودة إلى تسجيل الدخول
                </>
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Login
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}