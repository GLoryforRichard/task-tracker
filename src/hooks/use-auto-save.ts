'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AutoSaveOptions {
  key: string // localStorage key
  data: Record<string, any> // 要保存的数据
  debounceMs?: number // 防抖延迟，默认500ms
  enabled?: boolean // 是否启用自动保存，默认true
}

interface AutoSaveReturn {
  autoSaving: boolean
  lastSaved: Date | null
  clearDraft: () => void
  loadDraft: () => Record<string, any> | null
}

export function useAutoSave({
  key,
  data,
  debounceMs = 500,
  enabled = true
}: AutoSaveOptions): AutoSaveReturn {
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // 检查是否有有效内容需要保存
  const hasValidContent = useCallback(() => {
    return Object.values(data).some(value => {
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      if (typeof value === 'number') {
        return value > 0
      }
      if (typeof value === 'boolean') {
        return value
      }
      return Boolean(value)
    })
  }, [data])

  // 自动保存函数
  const autoSave = useCallback(async () => {
    if (!enabled || !hasValidContent()) return

    setAutoSaving(true)
    try {
      const draftData = {
        ...data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(draftData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto save error:', error)
    } finally {
      setAutoSaving(false)
    }
  }, [key, data, enabled, hasValidContent])

  // 清除草稿
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key)
    setLastSaved(null)
  }, [key])

  // 加载草稿
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(key)
      if (draft) {
        const draftData = JSON.parse(draft)
        // 检查草稿是否过期（24小时）
        const timestamp = draftData.timestamp
        if (timestamp) {
          const draftTime = new Date(timestamp)
          const now = new Date()
          const hoursElapsed = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60)
          
          if (hoursElapsed > 24) {
            // 草稿过期，清除
            clearDraft()
            return null
          }
        }
        
        setLastSaved(timestamp ? new Date(timestamp) : null)
        return draftData
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return null
  }, [key, clearDraft])

  // 监听数据变化，触发自动保存
  useEffect(() => {
    if (!enabled) return

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    
    autoSaveTimer.current = setTimeout(() => {
      autoSave()
    }, debounceMs)

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [autoSave, debounceMs, enabled])

  return {
    autoSaving,
    lastSaved,
    clearDraft,
    loadDraft
  }
}
