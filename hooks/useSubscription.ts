import { useState, useEffect } from 'react'
import { supabase } from '../services/SupabaseService'
import { checkUserSubscription, getUserSubscription } from '../services/ManualSubscriptionService'

export interface SubscriptionData {
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

export interface UseSubscriptionReturn {
  isSubscribed: boolean
  subscription: SubscriptionData | null
  loading: boolean
  error: string | null
  checkSubscription: () => Promise<void>
}

/**
 * Hook للتحقق من حالة الاشتراك
 */
export function useSubscription(): UseSubscriptionReturn {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setIsSubscribed(false)
        setSubscription(null)
        return
      }

      // التحقق من صحة الاشتراك
      const hasValidSubscription = await checkUserSubscription(user.id)
      setIsSubscribed(hasValidSubscription)

      if (hasValidSubscription) {
        // الحصول على تفاصيل الاشتراك
        const { data: subscriptionData, error: subError } = await getUserSubscription(user.id)
        
        if (subError) {
          console.error('Error fetching subscription details:', subError)
          setError('خطأ في جلب تفاصيل الاشتراك')
        } else {
          setSubscription(subscriptionData)
        }
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error('Error checking subscription:', err)
      setError('خطأ في التحقق من الاشتراك')
      setIsSubscribed(false)
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSubscription()

    // الاستماع لتغييرات المصادقة
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, _session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          checkSubscription()
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [])

  return {
    isSubscribed,
    subscription,
    loading,
    error,
    checkSubscription
  }
}

/**
 * Hook للتحقق من انتهاء صلاحية الاشتراك قريباً
 */
export function useSubscriptionExpiry() {
  const { subscription } = useSubscription()
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null)
  const [isExpiringSoon, setIsExpiringSoon] = useState(false)

  useEffect(() => {
    if (subscription && subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end)
      const now = new Date()
      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      setDaysUntilExpiry(diffDays)
      setIsExpiringSoon(diffDays <= 7 && diffDays > 0) // تحذير قبل أسبوع
    } else {
      setDaysUntilExpiry(null)
      setIsExpiringSoon(false)
    }
  }, [subscription])

  return {
    daysUntilExpiry,
    isExpiringSoon,
    expiryDate: subscription?.current_period_end ? new Date(subscription.current_period_end) : null
  }
}