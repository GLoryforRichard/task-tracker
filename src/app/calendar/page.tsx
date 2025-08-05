'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { CalendarView } from '@/components/calendar-view'
import { createClient } from '@/utils/supabase/client'

export default function CalendarPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser({ email: user.email || '' })
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router, supabase.auth])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            日历视图
          </h1>
          <p className="text-gray-600">
            查看每天的任务安排和时间分配
          </p>
        </div>

        <CalendarView />
      </div>
    </div>
  )
}