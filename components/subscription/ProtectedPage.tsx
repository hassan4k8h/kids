import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/SupabaseService'

export default function ProtectedPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error || !user) {
        navigate('/login')
        return
      }

      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('current_period_start', new Date().toISOString())
        .gte('current_period_end', new Date().toISOString())

      if (subError || !subscriptions || subscriptions.length === 0) {
        navigate('/subscribe')
        return
      }

      setLoading(false)
    }

    checkSubscription()
  }, [navigate])

  if (loading) return <div className="flex items-center justify-center min-h-screen">جارٍ التحقق من الاشتراك...</div>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ اشتراكك فعال – مرحبًا بك!
      </div>
    </div>
  )
}