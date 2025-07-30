import { useEffect, useState } from 'react'
import { supabase } from '../../services/SupabaseService'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  status: string
  plan_type: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
    } else {
      setSubscriptions(data || [])
    }
    setLoading(false)
  }

  const activate = async (id: string) => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30) // إضافة 30 يوم
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'active', 
        current_period_end: endDate.toISOString() 
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error activating subscription:', error)
    } else {
      fetchSubscriptions()
    }
  }

  const cancel = async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', id)
    
    if (error) {
      console.error('Error canceling subscription:', error)
    } else {
      fetchSubscriptions()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'canceled': return 'bg-red-500'
      case 'past_due': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جارٍ تحميل الاشتراكات...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">لوحة إدارة الاشتراكات</h1>
        <Button onClick={fetchSubscriptions}>تحديث</Button>
      </div>
      
      <div className="grid gap-4">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">لا توجد اشتراكات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    📧 {sub.user_id.substring(0, 8)}...
                  </CardTitle>
                  <Badge className={getStatusColor(sub.status)}>
                    {sub.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">نوع الخطة:</p>
                    <p className="font-medium">🧾 {sub.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الانتهاء:</p>
                    <p className="font-medium">📆 {new Date(sub.current_period_end).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإنشاء:</p>
                    <p className="font-medium">{new Date(sub.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                  {sub.stripe_subscription_id && (
                    <div>
                      <p className="text-sm text-gray-600">معرف Stripe:</p>
                      <p className="font-medium text-xs">{sub.stripe_subscription_id}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => activate(sub.id)}
                    variant="default"
                    size="sm"
                    disabled={sub.status === 'active'}
                  >
                    تفعيل
                  </Button>
                  <Button 
                    onClick={() => cancel(sub.id)}
                    variant="destructive"
                    size="sm"
                    disabled={sub.status === 'canceled'}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}