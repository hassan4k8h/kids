import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SubscriptionGuard, { SubscriptionStatus, SubscriptionCheck } from '../components/subscription/SubscriptionGuard'
import SubscriptionPage from '../components/subscription/SubscriptionPage'
import AdminSubscriptions from '../components/subscription/AdminSubscriptions'
import ProtectedPage from '../components/subscription/ProtectedPage'
import { useSubscription, useSubscriptionExpiry } from '../hooks/useSubscription'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'

/**
 * مثال على صفحة محمية بالاشتراك
 */
function PremiumGamePage() {
  return (
    <SubscriptionGuard>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">🎮 الألعاب المتقدمة</h1>
        <p>هذا المحتوى متاح فقط للمشتركين!</p>
        {/* محتوى اللعبة المدفوعة هنا */}
      </div>
    </SubscriptionGuard>
  )
}

/**
 * مثال على استخدام التحقق البسيط
 */
function GameCard({ title, isPremium = false }: { title: string; isPremium?: boolean }) {
  if (isPremium) {
    return (
      <SubscriptionCheck message="لعبة حصرية للمشتركين">
        <Card>
          <CardHeader>
            <CardTitle>{title} 👑</CardTitle>
          </CardHeader>
          <CardContent>
            <p>محتوى اللعبة المتقدمة</p>
          </CardContent>
        </Card>
      </SubscriptionCheck>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>محتوى اللعبة المجانية</p>
      </CardContent>
    </Card>
  )
}

/**
 * مثال على عرض معلومات الاشتراك
 */
function SubscriptionInfo() {
  const { isSubscribed, subscription, loading } = useSubscription()
  const { daysUntilExpiry, isExpiringSoon } = useSubscriptionExpiry()

  if (loading) {
    return <div>جارٍ التحميل...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          معلومات الاشتراك
          <SubscriptionStatus />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSubscribed && subscription ? (
          <div className="space-y-2">
            <p><strong>نوع الخطة:</strong> {subscription.plan_type}</p>
            <p><strong>الحالة:</strong> {subscription.status}</p>
            <p><strong>تاريخ الانتهاء:</strong> {new Date(subscription.current_period_end).toLocaleDateString('ar-SA')}</p>
            
            {isExpiringSoon && daysUntilExpiry && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertDescription>
                  ⚠️ سينتهي اشتراكك خلال {daysUntilExpiry} أيام
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">لا يوجد اشتراك نشط</p>
            <Button onClick={() => window.location.href = '/subscribe'}>
              اشترك الآن
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * مثال على التطبيق الكامل مع التوجيه
 */
function AppExample() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* شريط التنقل */}
        <nav className="bg-white shadow-sm border-b p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">اللعبة التعليمية</h1>
            <SubscriptionStatus />
          </div>
        </nav>

        {/* المحتوى الرئيسي */}
        <main className="container mx-auto p-6">
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/" element={
              <div className="grid gap-6">
                <SubscriptionInfo />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <GameCard title="لعبة الحروف" />
                  <GameCard title="لعبة الأرقام" />
                  <GameCard title="لعبة الذاكرة المتقدمة" isPremium />
                  <GameCard title="لعبة الألغاز الصعبة" isPremium />
                </div>
              </div>
            } />
            
            {/* صفحة الاشتراك */}
            <Route path="/subscribe" element={<SubscriptionPage />} />
            
            {/* صفحة محمية */}
            <Route path="/premium" element={<PremiumGamePage />} />
            
            {/* لوحة الإدارة */}
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            
            {/* صفحة محمية أخرى */}
            <Route path="/protected" element={<ProtectedPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default AppExample

/**
 * مثال على كيفية استخدام الخدمات مباشرة
 */
export async function subscriptionExamples() {
  const { createManualSubscription, checkUserSubscription } = await import('../services/ManualSubscriptionService')
  
  // إنشاء اشتراك شهري
  const monthlyResult = await createManualSubscription('user-id-here', 'monthly')
  console.log('Monthly subscription:', monthlyResult)
  
  // إنشاء اشتراك سنوي
  const yearlyResult = await createManualSubscription('user-id-here', 'yearly')
  console.log('Yearly subscription:', yearlyResult)
  
  // التحقق من الاشتراك
  const isSubscribed = await checkUserSubscription('user-id-here')
  console.log('Is subscribed:', isSubscribed)
}

/**
 * مثال على معالج الدفع اليدوي
 */
export function PaymentHandler() {
  const handleManualPayment = async (userId: string, planType: 'monthly' | 'yearly') => {
    try {
      const { createManualSubscription } = await import('../services/ManualSubscriptionService')
      const result = await createManualSubscription(userId, planType)
      
      if (!result.error) {
        alert('✅ تم تفعيل اشتراكك بنجاح!')
        // إعادة توجيه للصفحة المحمية
        window.location.href = '/premium'
      } else {
        alert('❌ حدث خطأ أثناء تفعيل الاشتراك')
        console.error(result.error)
      }
    } catch (error) {
      alert('❌ حدث خطأ غير متوقع')
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">معالج الدفع اليدوي</h3>
      <div className="flex gap-2">
        <Button onClick={() => handleManualPayment('user-id', 'monthly')}>
          تفعيل اشتراك شهري
        </Button>
        <Button onClick={() => handleManualPayment('user-id', 'yearly')}>
          تفعيل اشتراك سنوي
        </Button>
      </div>
    </div>
  )
}