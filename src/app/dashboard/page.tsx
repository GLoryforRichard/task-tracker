'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { TaskForm } from '@/components/task-form'
import { TaskHistory } from '@/components/task-history'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
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


  const handleTaskAdded = () => {
    // 触发历史记录刷新
    setRefreshTrigger(prev => prev + 1)
    console.log('Task added successfully!')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/90">
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto py-8 px-4">
                        <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 mb-2">
                    🐶 欢迎来到 PuppyHabits
                  </h1>
                  <p className="text-gray-600">
                    跟随小狗一起培养好习惯，开始记录你的任务和时间吧
                  </p>
                </div>

        <TaskForm onTaskAdded={handleTaskAdded} />
        
        {/* 历史记录区域 */}
        <div className="mt-8">
          <TaskHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}