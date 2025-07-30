import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import emailService from '../services/EmailService';

interface EmailTestProps {
  isRTL?: boolean;
}

export function EmailTest({ isRTL = true }: EmailTestProps) {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [serviceInfo, setServiceInfo] = useState(emailService.getServiceInfo());
  const [setupInfo] = useState(emailService.getEmailJSSetupInfo());

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const success = await emailService.testConnection();
      setResult({
        success,
        message: success 
          ? (isRTL ? 'تم الاتصال بخدمة البريد الإلكتروني بنجاح!' : 'Email service connection successful!')
          : (isRTL ? 'فشل في الاتصال بخدمة البريد الإلكتروني' : 'Failed to connect to email service')
      });
      setServiceInfo(emailService.getServiceInfo());
    } catch (error) {
      setResult({
        success: false,
        message: isRTL ? 'حدث خطأ أثناء اختبار الاتصال' : 'Error occurred while testing connection'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      setResult({
        success: false,
        message: isRTL ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const success = await emailService.sendTestEmail(testEmail);
      setResult({
        success,
        message: success 
          ? (isRTL ? `تم إرسال بريد الاختبار إلى ${testEmail} بنجاح!` : `Test email sent successfully to ${testEmail}!`)
          : (isRTL ? 'فشل في إرسال بريد الاختبار' : 'Failed to send test email')
      });
    } catch (error) {
      setResult({
        success: false,
        message: isRTL ? 'حدث خطأ أثناء إرسال البريد' : 'Error occurred while sending email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!testEmail.trim()) {
      setResult({
        success: false,
        message: isRTL ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const success = await emailService.sendNotificationEmail({
        userName: 'مستخدم تجريبي',
        userEmail: testEmail,
        message: 'هذه رسالة اختبار من سكيلو! تم تفعيل حسابك بنجاح وأصبح بإمكان أطفالك الاستمتاع بجميع الألعاب التعليمية.',
        type: 'general'
      });
      
      setResult({
        success,
        message: success 
          ? (isRTL ? `تم إرسال إشعار الاختبار إلى ${testEmail} بنجاح!` : `Test notification sent successfully to ${testEmail}!`)
          : (isRTL ? 'فشل في إرسال إشعار الاختبار' : 'Failed to send test notification')
      });
    } catch (error) {
      setResult({
        success: false,
        message: isRTL ? 'حدث خطأ أثناء إرسال الإشعار' : 'Error occurred while sending notification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              {isRTL ? 'اختبار خدمة البريد الإلكتروني' : 'Email Service Test'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'اختبر إعدادات Gmail SMTP وإرسال الرسائل الإلكترونية' 
                : 'Test Gmail SMTP settings and email sending functionality'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                {isRTL ? 'معلومات الخدمة:' : 'Service Info:'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">
                    {isRTL ? 'الحالة:' : 'Status:'}
                  </span>
                  <span className={`ml-2 ${serviceInfo.isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                    {serviceInfo.isInitialized 
                      ? (isRTL ? 'متصل' : 'Connected') 
                      : (isRTL ? 'غير متصل' : 'Disconnected')
                    }
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    {isRTL ? 'نوع الخدمة:' : 'Service Type:'}
                  </span>
                  <span className="ml-2">{serviceInfo.serviceType}</span>
                </div>
                <div>
                  <span className="font-medium">
                    {isRTL ? 'خادم SMTP:' : 'SMTP Host:'}
                  </span>
                  <span className="ml-2">{serviceInfo.smtpHost}:{serviceInfo.smtpPort}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">
                    {isRTL ? 'البريد المرسل:' : 'From Email:'}
                  </span>
                  <span className="ml-2">{serviceInfo.fromEmail}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">
                    {isRTL ? 'معرف الخدمة:' : 'Service ID:'}
                  </span>
                  <span className="ml-2">{serviceInfo.serviceId}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">
                    {isRTL ? 'وضع التشغيل:' : 'Mode:'}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    serviceInfo.mockMode 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {serviceInfo.mockMode 
                      ? (isRTL ? 'وضع المحاكاة' : 'Mock Mode') 
                      : (isRTL ? 'وضع حقيقي' : 'Live Mode')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="space-y-3">
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 ml-2" />
                )}
                {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
              </Button>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                {isRTL ? 'عنوان البريد الإلكتروني للاختبار:' : 'Test Email Address:'}
              </label>
              <Input
                type="email"
                placeholder={isRTL ? 'أدخل البريد الإلكتروني...' : 'Enter email address...'}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={handleSendTestEmail} 
                disabled={isLoading || !testEmail.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Send className="w-4 h-4 ml-2" />
                )}
                {isRTL ? 'إرسال بريد ترحيب' : 'Send Welcome Email'}
              </Button>

              <Button 
                onClick={handleSendNotification} 
                disabled={isLoading || !testEmail.trim()}
                className="w-full"
                variant="secondary"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Mail className="w-4 h-4 ml-2" />
                )}
                {isRTL ? 'إرسال إشعار' : 'Send Notification'}
              </Button>
            </div>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{result.message}</span>
              </div>
            )}

            {/* EmailJS Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {isRTL ? 'إعداد EmailJS:' : 'EmailJS Setup:'}
              </h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p className="font-medium">
                  {isRTL ? 'خطوات الإعداد:' : 'Setup Steps:'}
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  {setupInfo.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                  <p className="font-medium">
                    {isRTL ? 'إعدادات Gmail SMTP:' : 'Gmail SMTP Settings:'}
                  </p>
                  <p>Host: {setupInfo.smtpConfig.host}</p>
                  <p>Port: {setupInfo.smtpConfig.port}</p>
                  <p>User: {setupInfo.smtpConfig.user}</p>
                  <p>Pass: {setupInfo.smtpConfig.pass.substring(0, 4)}****</p>
                </div>
                <a 
                  href={setupInfo.setupUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                >
                  {isRTL ? 'فتح EmailJS' : 'Open EmailJS'}
                </a>
              </div>
            </div>

            {/* Current Status */}
            <div className={`border rounded-lg p-4 ${
              serviceInfo.mockMode 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                serviceInfo.mockMode ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {isRTL ? 'الحالة الحالية:' : 'Current Status:'}
              </h4>
              <p className={`text-sm ${
                serviceInfo.mockMode ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {serviceInfo.mockMode 
                  ? (isRTL 
                      ? '🔧 وضع المحاكاة مُفعل - جميع الرسائل ستظهر في وحدة التحكم فقط. إعدادات Gmail SMTP جاهزة للاستخدام الفعلي.' 
                      : '🔧 Mock mode is enabled - all emails will appear in console only. Gmail SMTP settings are ready for live use.'
                    )
                  : (isRTL 
                      ? '✅ الخدمة تعمل في الوضع الحقيقي - الرسائل ستُرسل فعلياً عبر Gmail SMTP.' 
                      : '✅ Service is running in live mode - emails will be sent via Gmail SMTP.'
                    )
                }
              </p>
              {serviceInfo.mockMode && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
                  <p className="font-medium text-yellow-800">
                    {isRTL ? 'إعدادات Gmail SMTP الجاهزة:' : 'Ready Gmail SMTP Settings:'}
                  </p>
                  <p className="text-yellow-700">📧 {setupInfo.smtpConfig.user}</p>
                  <p className="text-yellow-700">🔐 {setupInfo.smtpConfig.pass.substring(0, 4)}****</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}