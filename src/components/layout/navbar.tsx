'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Calendar, BarChart3, Target, Plus, Palette } from 'lucide-react'
import { BackgroundSettings } from '@/components/background-settings'
import { Logo } from '@/components/logo'
import { useUserProfile } from '@/hooks/use-user-profile'
import { createClient } from '@/utils/supabase/client'

interface NavbarProps {
  user: { email: string }
}

export function Navbar({ user }: NavbarProps) {
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false)
  const { profile } = useUserProfile()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                记录任务
              </Button>
            </Link>
            
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                日历
              </Button>
            </Link>
            
            <Link href="/charts">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                图表
              </Button>
            </Link>
            
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                <Target className="h-4 w-4 mr-1" />
                目标
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsBackgroundSettingsOpen(true)}
              title="背景设置"
            >
              <Palette className="h-4 w-4 mr-1" />
              背景
            </Button>

            <div className="flex items-center space-x-3">
              {/* 用户头像和信息 */}
              <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="用户头像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{profile?.nickname || '用户'}</span>
                  <span className="text-xs text-gray-500">点击进入用户中心</span>
                </div>
              </Link>
              
              {/* 登出按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                title="登出"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 背景设置弹窗 */}
      <BackgroundSettings 
        isOpen={isBackgroundSettingsOpen}
        onClose={() => setIsBackgroundSettingsOpen(false)}
      />
    </nav>
  )
}