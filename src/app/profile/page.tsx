'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Camera, Save, User, ArrowLeft, RotateCcw } from 'lucide-react'

interface UserProfile {
  email: string
  nickname: string
  avatar: string | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    nickname: '',
    avatar: null
  })
  const [tempNickname, setTempNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const supabase = createClient()

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser({ email: user.email || '' })
      
      // 从 localStorage 加载用户资料
      const savedProfile = localStorage.getItem(`user-profile-${user.id}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setProfile({
          email: user.email || '',
          nickname: profileData.nickname || '',
          avatar: profileData.avatar || null
        })
        setTempNickname(profileData.nickname || '')
      } else {
        // 初始化默认资料
        const defaultProfile = {
          email: user.email || '',
          nickname: user.email?.split('@')[0] || '用户',
          avatar: null
        }
        setProfile(defaultProfile)
        setTempNickname(defaultProfile.nickname)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, supabase.auth])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 检查文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('头像文件不能超过2MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setSelectedAvatar(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('用户未登录')
      }

      const updatedProfile = {
        email: user.email || '',
        nickname: tempNickname.trim() || user.email?.split('@')[0] || '用户',
        avatar: selectedAvatar || profile.avatar
      }

      // 保存到 localStorage
      localStorage.setItem(`user-profile-${user.id}`, JSON.stringify({
        nickname: updatedProfile.nickname,
        avatar: updatedProfile.avatar
      }))

      setProfile(updatedProfile)
      setSelectedAvatar(null)
      
      // 发送自定义事件通知其他组件更新
      window.dispatchEvent(new Event('profile-updated'))
      
      alert('资料保存成功！')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleResetAvatar = () => {
    setSelectedAvatar(null)
  }

  const currentAvatar = selectedAvatar || profile.avatar

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* 页面头部 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">用户中心</h1>
          <p className="text-gray-600 mt-2">管理你的个人资料和偏好设置</p>
        </div>

        {/* 用户资料卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          
          {/* 头像设置 */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6">头像设置</h2>
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="用户头像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* 头像上传按钮 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="h-5 w-5" />
              </button>
              
              {/* 重置按钮 */}
              {currentAvatar && (
                <button
                  onClick={handleResetAvatar}
                  className="absolute bottom-2 left-2 w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            
            <p className="text-sm text-gray-500 mt-4">
              点击相机图标上传头像，支持 JPG、PNG 格式，文件大小不超过 2MB
            </p>
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">基本信息</h2>
            
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">邮箱地址无法修改</p>
            </div>

            {/* 昵称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                昵称
              </label>
              <Input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="请输入昵称"
                maxLength={20}
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                昵称将在导航栏和其他地方显示，最多20个字符
              </p>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="h-4 w-4 mr-2" />
                  保存资料
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                关于用户资料
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • 头像和昵称信息保存在本地浏览器中<br/>
                  • 更换设备或清除浏览器数据后需要重新设置<br/>
                  • 头像建议使用正方形图片以获得最佳显示效果
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}