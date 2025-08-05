'use client'

import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <Link 
      href="/dashboard" 
      className={`flex items-center space-x-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 transition-all duration-200 ${sizeClasses[size]} ${className}`}
    >
      {/* 小狗图标 */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          {/* 狗狗脸部 */}
          <div className="relative">
            {/* 耳朵 */}
            <div className="absolute -top-1 -left-1 w-2 h-3 bg-purple-600 rounded-full transform rotate-12"></div>
            <div className="absolute -top-1 -right-1 w-2 h-3 bg-purple-600 rounded-full transform -rotate-12"></div>
            
            {/* 脸部 */}
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              {/* 眼睛 */}
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
              </div>
              {/* 鼻子 */}
              <div className="absolute bottom-1 w-0.5 h-0.5 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* 装饰性小点 */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
      </div>
      
      {/* 品牌名称 */}
      <span className="font-extrabold tracking-tight">
        PuppyHabits
      </span>
      
      {/* 装饰性小标签 */}
      <div className="hidden sm:flex items-center">
        <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full font-medium">
          习惯追踪
        </span>
      </div>
    </Link>
  )
}