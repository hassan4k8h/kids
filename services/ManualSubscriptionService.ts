import { supabase } from './SupabaseService'

export interface CreateSubscriptionParams {
  userId: string
  planType?: 'monthly' | 'yearly'
  stripeSubscriptionId?: string
}

export interface SubscriptionResult {
  data: any
  error: any
}

/**
 * إنشاء اشتراك يدوي جديد
 */
export async function createManualSubscription(
  userId: string, 
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<SubscriptionResult> {
  const now = new Date()
  const daysToAdd = planType === 'yearly' ? 365 : 30
  const end = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase.from('subscriptions').insert([
    {
      user_id: userId,
      plan_type: planType,
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      status: 'active'
    }
  ])

  return { data, error }
}

/**
 * التحقق من صحة الاشتراك للمستخدم
 */
export async function checkUserSubscription(userId: string): Promise<boolean> {
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('current_period_start', new Date().toISOString())
    .gte('current_period_end', new Date().toISOString())

  if (error) {
    console.error('Error checking subscription:', error)
    return false
  }

  return subscriptions && subscriptions.length > 0
}

/**
 * الحصول على تفاصيل اشتراك المستخدم
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

/**
 * تجديد اشتراك موجود
 */
export async function renewSubscription(
  subscriptionId: string, 
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<SubscriptionResult> {
  const now = new Date()
  const daysToAdd = planType === 'yearly' ? 365 : 30
  const end = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      status: 'active',
      plan_type: planType
    })
    .eq('id', subscriptionId)

  return { data, error }
}

/**
 * إلغاء اشتراك
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscriptionId)

  return { data, error }
}

/**
 * الحصول على جميع الاشتراكات (للمسؤول)
 */
export async function getAllSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * التحقق من انتهاء صلاحية الاشتراكات وتحديث حالتها
 */
export async function updateExpiredSubscriptions() {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .lt('current_period_end', now)
    .eq('status', 'active')

  return { data, error }
}