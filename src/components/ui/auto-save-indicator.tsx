'use client'

import { format } from 'date-fns'

interface AutoSaveIndicatorProps {
  autoSaving: boolean
  lastSaved: Date | null
  className?: string
}

export function AutoSaveIndicator({ autoSaving, lastSaved, className = '' }: AutoSaveIndicatorProps) {
  return (
    <div className={`flex items-center space-x-2 text-xs text-gray-500 ${className}`}>
      {autoSaving && (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>自动保存中...</span>
        </>
      )}
      {lastSaved && !autoSaving && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>已保存草稿 {format(lastSaved, 'HH:mm:ss')}</span>
        </>
      )}
    </div>
  )
}
