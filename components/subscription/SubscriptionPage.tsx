import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/SupabaseService'
import { createManualSubscription } from '../../services/ManualSubscriptionService'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  const plans = {
    monthly: {
      name: 'الخطة الشهرية',
      price: '$5',
      duration: 'شهر واحد',
      features: [
        '🎮 الوصول لجميع الألعاب',
        '🏆 نظام الإنجازات الكامل',
        '📊 تتبع التقدم',
        '🎨 محتوى حصري',
        '📱 دعم جميع الأجهزة'
      ]
    },
    yearly: {
      name: 'الخطة السنوية',
      price: '$50',
      duration: 'سنة كاملة',
      features: [
        '🎮 الوصول لجميع الألعاب',
        '🏆 نظام الإنجازات الكامل',
        '📊 تتبع التقدم المتقدم',
        '🎨 محتوى حصري + تحديثات',
        '📱 دعم جميع الأجهزة',
        '💰 توفير 17% مقارنة بالشهرية',
        '🎁 مكافآت إضافية'
      ]
    }
  }

  const handleSubscription = async () => {
    setLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('يجب تسجيل الدخول أولاً')
        navigate('/login')
        return
      }

      const result = await createManualSubscription(user.id, selectedPlan)
      
      if (!result.error) {
        toast.success('✅ تم تفعيل اشتراكك بنجاح!')
        navigate('/premium')
      } else {
        console.error('Subscription error:', result.error)
        toast.error('❌ حدث خطأ أثناء تفعيل الاشتراك')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('❌ حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">اختر خطة الاشتراك المناسبة</h1>
        <p className="text-gray-600 text-lg">
          احصل على الوصول الكامل لجميع الألعاب التعليمية والمحتوى الحصري
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all duration-200 ${
              selectedPlan === key 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {key === 'yearly' && (
                  <Badge className="bg-green-500">الأكثر توفيراً</Badge>
                )}
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {plan.price}
                <span className="text-sm text-gray-500 font-normal">/{plan.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">طرق الدفع المتاحة:</h3>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>💳 PayPal</span>
            <span>🪙 USDT</span>
            <span>🏦 تحويل بنكي</span>
            <span>💰 فودافون كاش</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            بعد النقر على "اشترك الآن"، سيتم توجيهك لإتمام عملية الدفع
          </p>
        </div>

        <Button 
          onClick={handleSubscription}
          disabled={loading}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جارٍ التفعيل...
            </span>
          ) : (
            `اشترك الآن – ${plans[selectedPlan].name}`
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          بالنقر على "اشترك الآن" فإنك توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  )
}