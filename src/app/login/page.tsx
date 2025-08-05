'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        throw error
      }
      
      console.log('Login successful:', data)
      console.log('Session:', data.session)
      console.log('User:', data.user)
      
      if (data.session && data.user) {
        // 直接跳转，让中间件处理认证状态
        router.push('/dashboard')
        router.refresh()
      } else {
        throw new Error('登录成功但未获得有效会话')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError(error instanceof Error ? error.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">登录账户</h1>
          <p className="mt-2 text-gray-600">
            继续追踪你的任务和时间
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <div className="text-center">
            <Link href="/register" className="text-blue-600 hover:underline">
              还没有账户？立即注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}