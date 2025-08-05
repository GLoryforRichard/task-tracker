'use client'

import { useEffect } from 'react'

interface BackgroundProviderProps {
  children: React.ReactNode
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  useEffect(() => {
    // 在客户端加载时应用保存的背景设置
    const savedBackground = localStorage.getItem('website-background')
    if (savedBackground) {
      document.body.style.background = savedBackground
      document.body.style.backgroundSize = savedBackground.startsWith('url(') ? 'cover' : 'auto'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundAttachment = 'fixed'
    }
  }, [])

  return <>{children}</>
}