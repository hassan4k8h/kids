import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, ArrowRight, Mail, Send, CheckCircle, XCircle, Loader2, Shield, Clock } from 'lucide-react';
import { authService } from '../../services/AuthService';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onResetSent: (email: string) => void;
  isRTL?: boolean;
  onLanguageChange?: (isRTL: boolean) => void;
}

export function ForgotPasswordScreen({ 
  onBack, 
  onResetSent, 
  isRTL = true, 
  onLanguageChange 
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // التحقق من صحة البريد الإلكتروني
    if (!email.trim()) {
      setError(isRTL ? 'يرجى إدخال عنوان البريد الإلكتروني' : 'Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError(isRTL ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Requesting password reset for:', email);
      
      // استدعاء AuthService لإرسال كود التوثيق
      const result = await authService.requestVerificationCode(email.trim());
      
      if (result.success) {
        setSuccess(
          result.message || (isRTL 
            ? `تم إرسال كود التوثيق إلى ${email}. يرجى التحقق من صندوق الوارد الخاص بك.`
            : `Verification code has been sent to ${email}. Please check your inbox.`)
        );
        
        setTimeout(() => {
          onResetSent(email.trim());
        }, 3000);
      } else {
        setError(
          result.error || (isRTL 
            ? 'فشل في إرسال كود التوثيق. يرجى المحاولة مرة أخرى.'
            : 'Failed to send verification code. Please try again.')
        );
      }
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      setError(
        isRTL 
          ? 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while processing your request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoading, validateEmail, onResetSent, isRTL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isRTL ? '🔐 نسيت كلمة المرور؟' : '🔐 Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isRTL 
                ? 'لا تقلق! أدخل عنوان بريدك الإلكتروني وسنرسل لك كود توثيق لإعادة تعيين كلمة المرور'
                : "Don't worry! Enter your email address and we'll send you a verification code to reset your password"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700 font-medium">
                    {error}
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
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    {isRTL ? 'جارٍ الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    {isRTL ? 'إرسال كود التوثيق' : 'Send Verification Code'}
                  </>
                )}
              </Button>
            </form>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Shield className="w-4 h-4 ml-2" />
                {isRTL ? 'معلومات الأمان:' : 'Security Information:'}
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center">
                  <Clock className="w-3 h-3 ml-2 flex-shrink-0" />
                  {isRTL 
                    ? 'كود التوثيق صالح لمدة 15 دقيقة فقط'
                    : 'Verification code expires in 15 minutes'
                  }
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-3 h-3 ml-2 flex-shrink-0" />
                  {isRTL 
                    ? 'الكود يعمل مرة واحدة فقط لضمان الأمان'
                    : 'Code works only once for security'
                  }
                </li>
                <li className="flex items-center">
                  <Mail className="w-3 h-3 ml-2 flex-shrink-0" />
                  {isRTL 
                    ? 'تحقق من مجلد الرسائل غير المرغوب فيها'
                    : 'Check your spam folder if needed'
                  }
                </li>
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

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>
            {isRTL 
              ? 'لم تتلق كود التوثيق؟ تحقق من مجلد الرسائل غير المرغوب فيها أو'
              : "Didn't receive the verification code? Check your spam folder or"
            }
          </p>
          <Button
            variant="link"
            onClick={() => window.location.reload()}
            className="text-white/90 hover:text-white underline p-0 h-auto font-normal"
          >
            {isRTL ? 'حاول مرة أخرى' : 'try again'}
          </Button>
        </div>
      </div>
    </div>
  );
}