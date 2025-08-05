'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Calendar, BarChart3, Target, Plus, Palette } from 'lucide-react'
import { BackgroundSettings } from '@/components/background-settings'
import { createClient } from '@/utils/supabase/client'

interface NavbarProps {
  user: { email: string }
}

export function Navbar({ user }: NavbarProps) {
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false)
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
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              任务追踪器
            </Link>
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

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
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