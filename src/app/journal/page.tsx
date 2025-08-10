'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'

interface JournalEntry {
  id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}

export default function JournalPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [journalEntries, setJournalEntries] = useState<{ [key: string]: JournalEntry }>({})
  const [showEditor, setShowEditor] = useState(false)
  const router = useRouter()
  
  const supabase = createClient()

  const checkUser = useCallback(async () => {
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
  }, [router, supabase.auth])

  const fetchJournalEntries = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))

      if (error) {
        if (error.message.includes('relation "journal_entries" does not exist')) {
          console.log('Journal entries table does not exist')
          setJournalEntries({})
          return
        }
        throw error
      }

      const entriesMap: { [key: string]: JournalEntry } = {}
      data?.forEach((entry: any) => {
        entriesMap[entry.date] = entry
      })
      setJournalEntries(entriesMap)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      setJournalEntries({})
    }
  }, [supabase, currentDate])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  useEffect(() => {
    if (user) {
      fetchJournalEntries()
    }
  }, [user, fetchJournalEntries])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setShowEditor(true)
  }

  const hasEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return journalEntries[dateStr] !== undefined
  }

  const getEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return journalEntries[dateStr]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 mb-2">
            📅 日历记录
          </h1>
          <p className="text-gray-600">按日期记录生活点滴，点击日期开始记录</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 日历视图 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {format(currentDate, 'yyyy年MM月')}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历日期 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 填充月初空白 */}
              {Array.from({ length: monthStart.getDay() }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* 月份天数 */}
              {monthDays.map((day) => {
                const hasJournalEntry = hasEntry(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => selectDate(day)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all relative ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isToday
                        ? 'bg-blue-100 text-blue-600 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {format(day, 'd')}
                    {hasJournalEntry && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-blue-500'
                      }`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 记录编辑器或概览 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
            {showEditor && selectedDate ? (
              <JournalEditor
                key={format(selectedDate, 'yyyy-MM-dd')}
                date={selectedDate}
                entry={getEntry(selectedDate)}
                onSave={fetchJournalEntries}
                onClose={() => setShowEditor(false)}
              />
            ) : (
              <div className="text-center py-20">
                <BookOpen className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  选择一个日期开始记录
                </h3>
                <p className="text-gray-600 mb-6">
                  点击左侧日历中的任意日期，开始记录那一天的内容
                </p>
                <Button
                  onClick={() => selectDate(new Date())}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  记录今天
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface JournalEditorProps {
  date: Date
  entry?: JournalEntry
  onSave: () => void
  onClose: () => void
}

function JournalEditor({ date, entry, onSave, onClose }: JournalEditorProps) {
  const [content, setContent] = useState(entry?.content || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // 当切换日期或传入的 entry 变化时，重置本地编辑内容，避免跨天内容串联
  useEffect(() => {
    setContent(entry?.content || '')
  }, [entry?.id, date])

  const saveEntry = async () => {
    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const dateStr = format(date, 'yyyy-MM-dd')

      if (entry) {
        // 更新现有记录
        const { error } = await supabase
          .from('journal_entries')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id)

        if (error) throw error
      } else {
        // 创建新记录
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            date: dateStr,
            content: content.trim(),
          })

        if (error) throw error
      }

      onSave()
      alert('记录保存成功！')
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async () => {
    if (!entry || !window.confirm('确定要删除这条记录吗？')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error

      onSave()
      onClose()
      alert('记录删除成功！')
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(date, 'yyyy年MM月dd日 EEEE')}
        </h3>
        <div className="flex items-center space-x-2">
          {entry && (
            <Button
              onClick={deleteEntry}
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-100"
            >
              删除
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            取消
          </Button>
          <Button
            onClick={saveEntry}
            disabled={saving}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div>
        <textarea
          placeholder="记录这一天发生的事情..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-80 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
      </div>

      <div className="text-sm text-gray-500">
        {entry ? `创建于 ${format(new Date(entry.created_at), 'MM/dd HH:mm')}` : '新建记录'}
        {entry && entry.updated_at !== entry.created_at && (
          <span> · 更新于 {format(new Date(entry.updated_at), 'MM/dd HH:mm')}</span>
        )}
      </div>
    </div>
  )
}