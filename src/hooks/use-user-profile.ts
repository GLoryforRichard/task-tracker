'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

interface UserProfile {
  email: string
  nickname: string
  avatar: string | null
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }

      // 从 localStorage 加载用户资料
      const savedProfile = localStorage.getItem(`user-profile-${user.id}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setProfile({
          email: user.email || '',
          nickname: profileData.nickname || user.email?.split('@')[0] || '用户',
          avatar: profileData.avatar || null
        })
      } else {
        // 初始化默认资料
        setProfile({
          email: user.email || '',
          nickname: user.email?.split('@')[0] || '用户',
          avatar: null
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // 监听存储变化以实时更新
  useEffect(() => {
    const handleStorageChange = () => {
      loadProfile()
    }

    window.addEventListener('storage', handleStorageChange)
    // 监听自定义事件，用于同一页面内的更新
    window.addEventListener('profile-updated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profile-updated', handleStorageChange)
    }
  }, [loadProfile])

  return { profile, loading, refetch: loadProfile }
}