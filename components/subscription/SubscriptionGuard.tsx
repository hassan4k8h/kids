import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../../hooks/useSubscription'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

interface SubscriptionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  showUpgrade?: boolean
}

/**
 * مكون لحماية المحتوى المدفوع
 * يتحقق من صحة الاشتراك ويعرض المحتوى أو رسالة الترقية
 */
export default function SubscriptionGuard({ 
  children, 
  fallback, 
  redirectTo = '/subscribe',
  showUpgrade = true 
}: SubscriptionGuardProps) {
  const navigate = useNavigate()
  const { isSubscribed, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">جارٍ التحقق من الاشتراك...</span>
      </div>
    )
  }

  if (isSubscribed) {
    return <>{children}</>
  }

  // إذا كان هناك fallback مخصص
  if (fallback) {
    return <>{fallback}</>
  }

  // عرض رسالة الترقية الافتراضية
  if (showUpgrade) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <CardTitle className="text-2xl mb-2">
              محتوى حصري للمشتركين
            </CardTitle>
            <Badge className="mx-auto bg-yellow-500">
              يتطلب اشتراك نشط
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              هذا المحتوى متاح فقط للمشتركين في الخطة المدفوعة.
              اشترك الآن للحصول على الوصول الكامل لجميع الألعاب والمحتوى الحصري.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">ما ستحصل عليه:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🎮 الوصول لجميع الألعاب التعليمية</li>
                <li>🏆 نظام الإنجازات الكامل</li>
                <li>📊 تتبع التقدم المتقدم</li>
                <li>🎨 محتوى حصري ومحدث</li>
                <li>📱 دعم جميع الأجهزة</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => navigate(redirectTo)}
                size="lg"
                className="px-6"
              >
                اشترك الآن
              </Button>
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
              >
                العودة
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              خطط مرنة تبدأ من $5 شهرياً
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // إعادة توجيه تلقائية
  navigate(redirectTo)
  return null
}

/**
 * مكون مبسط للتحقق من الاشتراك مع رسالة مخصصة
 */
export function SubscriptionCheck({ 
  children, 
  message = "يتطلب اشتراك نشط" 
}: { 
  children: React.ReactNode
  message?: string 
}) {
  const { isSubscribed, loading } = useSubscription()

  if (loading) {
    return <div className="text-center py-4">جارٍ التحقق...</div>
  }

  if (!isSubscribed) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔒</div>
        <p className="text-gray-600">{message}</p>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * مكون لعرض حالة الاشتراك في الواجهة
 */
export function SubscriptionStatus() {
  const { isSubscribed, subscription, loading } = useSubscription()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
        جارٍ التحقق...
      </div>
    )
  }

  if (!isSubscribed) {
    return (
      <Button 
        onClick={() => navigate('/subscribe')}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        ترقية الحساب
      </Button>
    )
  }

  return (
    <Badge className="bg-green-500 text-xs">
      {subscription?.plan_type === 'yearly' ? 'مشترك سنوي' : 'مشترك شهري'}
    </Badge>
  )
}