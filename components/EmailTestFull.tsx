import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import emailService from '../services/EmailService';

interface EmailTestFullProps {
  isRTL?: boolean;
}

export function EmailTestFull({ isRTL = true }: EmailTestFullProps) {
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    test: string;
    success: boolean;
    message: string;
    timestamp: string;
  }>>([]);

  const addResult = (test: string, success: boolean, message: string) => {
    const result = {
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };
    setResults(prev => [result, ...prev]);
  };

  const testEmailService = async () => {
    if (!testEmail || !testName) {
      addResult('التحقق من البيانات', false, 'يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }

    setIsLoading(true);
    
    try {
      // اختبار 1: التحقق من تهيئة الخدمة
      addResult('تهيئة الخدمة', true, 'بدء اختبار نظام البريد الإلكتروني...');

      // اختبار 2: فحص إعدادات EmailJS
      const serviceInfo = emailService.getServiceInfo();
      addResult('فحص الإعدادات', true, 
        `Service ID: ${serviceInfo.serviceId}, Mock Mode: ${serviceInfo.mockMode ? 'مُفعل' : 'مُعطل'}`
      );

      // اختبار 3: اختبار الاتصال
      addResult('اختبار الاتصال', true, 'جاري اختبار الاتصال مع EmailJS...');
      const connectionTest = await emailService.testConnection();
      addResult('نتيجة الاتصال', connectionTest, 
        connectionTest ? 'تم الاتصال بنجاح' : 'فشل في الاتصال'
      );

      // اختبار 4: عرض البيانات المرسلة
      addResult('البيانات المرسلة', true, 
        `📊 البيانات التي سيتم إرسالها:
        • إلى البريد: ${testEmail}
        • إلى الاسم: ${testName}
        • من: Skilloo Kids Educational Game
        • البريد المرسل من: exiq99@gmail.com`
      );

      // اختبار 5: إرسال بريد ترحيب
      addResult('إرسال بريد الترحيب', true, `جاري إرسال بريد ترحيب إلى ${testEmail}...`);
      const welcomeEmailSent = await emailService.sendWelcomeEmail({
        userName: testName,
        userEmail: testEmail
      });
      addResult('نتيجة بريد الترحيب', welcomeEmailSent,
        welcomeEmailSent 
          ? `✅ تم إرسال بريد الترحيب بنجاح إلى ${testEmail}` 
          : `❌ فشل في إرسال بريد الترحيب إلى ${testEmail}`
      );

      // اختبار 6: إرسال إشعار
      addResult('إرسال إشعار', true, 'جاري إرسال إشعار تجريبي...');
      const notificationSent = await emailService.sendNotificationEmail({
        userName: testName,
        userEmail: testEmail,
        type: 'general',
        message: 'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح.'
      });
      addResult('نتيجة الإشعار', notificationSent,
        notificationSent 
          ? `✅ تم إرسال الإشعار بنجاح إلى ${testEmail}` 
          : `❌ فشل في إرسال الإشعار إلى ${testEmail}`
      );

      // اختبار 7: إرسال بريد إعادة تعيين كلمة المرور
      addResult('إعادة تعيين كلمة المرور', true, 'جاري إرسال بريد إعادة تعيين كلمة المرور...');
      const resetEmailSent = await emailService.sendPasswordResetEmail({
        userName: testName,
        userEmail: testEmail,
        resetToken: 'test_token_123',
        resetUrl: 'https://skilloo.netlify.app/reset?token=test_token_123',
        expiresIn: '30 دقيقة'
      });
      addResult('نتيجة إعادة التعيين', resetEmailSent,
        resetEmailSent 
          ? `✅ تم إرسال بريد إعادة التعيين بنجاح إلى ${testEmail}` 
          : `❌ فشل في إرسال بريد إعادة التعيين إلى ${testEmail}`
      );

      // النتيجة النهائية
      const totalTests = 4; // عدد الاختبارات الفعلية (الاتصال + الترحيب + الإشعار + إعادة التعيين)
      const successfulTests = [connectionTest, welcomeEmailSent, notificationSent, resetEmailSent].filter(Boolean).length;
      
      addResult('النتيجة النهائية', successfulTests > 0,
        `تم بنجاح: ${successfulTests} من أصل ${totalTests} اختبارات. ${successfulTests === totalTests ? '🎉 جميع الاختبارات نجحت!' : '⚠️ بعض الاختبارات فشلت'}`
      );

      // تحذير مهم حول القالب
      addResult('⚠️ تحذير مهم', true,
        `إذا وصلت الرسائل إلى hassan.412iraq2@gmail.com بدلاً من ${testEmail}، فهذا يعني أن قالب EmailJS يحتاج إصلاح. راجع ملف FIX_EMAILJS_TEMPLATE.md`
      );

    } catch (error) {
      addResult('خطأ عام', false, `حدث خطأ: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-blue-600">
              🧪 اختبار شامل لنظام البريد الإلكتروني
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                هذا الاختبار سيرسل رسائل بريد إلكتروني حقيقية إلى العنوان المحدد. 
                تأكد من استخدام بريد إلكتروني صحيح يمكنك الوصول إليه.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الاختبار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testName">الاسم</Label>
              <Input
                id="testName"
                type="text"
                placeholder="أدخل اسم للاختبار"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div>
              <Label htmlFor="testEmail">البريد الإلكتروني</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="أدخل بريد إلكتروني صحيح"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={testEmailService} 
                disabled={isLoading || !testEmail || !testName}
                className="flex-1"
              >
                {isLoading ? '🔄 جاري الاختبار...' : '🧪 بدء الاختبار الشامل'}
              </Button>
              
              <Button 
                onClick={clearResults} 
                variant="outline"
                disabled={results.length === 0}
              >
                🗑️ مسح النتائج
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-r-4 ${
                      result.success 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {result.success ? '✅' : '❌'} {result.test}
                        </div>
                        <div className="text-sm mt-1">{result.message}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الخدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Service ID:</strong> service_m7qnbim
              </div>
              <div>
                <strong>Template ID:</strong> template_5ckv8cg
              </div>
              <div>
                <strong>Gmail Account:</strong> exiq99@gmail.com
              </div>
              <div>
                <strong>Public Key:</strong> EKNDfJSYQ71ImQyJ3
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertDescription>
                <strong>🔍 كيف يعمل النظام:</strong><br/>
                • النظام يرسل البيانات مع المتغير <code>to_email</code><br/>
                • قالب EmailJS يجب أن يستخدم <code>{'{{to_email}}'}</code><br/>
                • إذا وصلت الرسائل إلى hassan.412iraq2@gmail.com، فالقالب يحتاج إصلاح<br/>
                • راجع ملف <code>FIX_EMAILJS_TEMPLATE.md</code> للحل
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}