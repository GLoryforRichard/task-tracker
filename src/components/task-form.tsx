'use client'

import { useState, useEffect, useRef } from 'react'
import { format, startOfWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

interface TaskFormProps {
  onTaskAdded?: () => void
}

interface WeeklyGoal {
  id: string
  task_category: string
  target_hours: number
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [taskName, setTaskName] = useState('')
  const [hours, setHours] = useState('')
  const [reflection, setReflection] = useState('')
  const [weeklyGoalId, setWeeklyGoalId] = useState<string>('')
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchWeeklyGoals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const weekStart = format(startOfWeek(new Date(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
        
        const { data: goalsData, error: goalsError } = await supabase
          .from('weekly_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_start', weekStart)

        if (goalsError) throw goalsError

        setWeeklyGoals(goalsData || [])
      } catch (error) {
        console.error('Error fetching weekly goals:', error)
      }
    }

    fetchWeeklyGoals()
  }, [date, supabase])

  // 自动保存功能
  const autoSave = async () => {
    const hasContent = taskName.trim() || hours.trim() || reflection.trim()
    if (!hasContent) return

    setAutoSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let taskCategory = taskName.trim()
      if (weeklyGoalId) {
        const selectedGoal = weeklyGoals.find(goal => goal.id === weeklyGoalId)
        if (selectedGoal) {
          taskCategory = selectedGoal.task_category
        }
      }

      // 这里只是模拟自动保存到 localStorage
      // 实际项目中可以保存为草稿到数据库
      const draftData = {
        date,
        taskName,
        hours,
        reflection,
        weeklyGoalId,
        taskCategory,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('task_draft', JSON.stringify(draftData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto save error:', error)
    } finally {
      setAutoSaving(false)
    }
  }

  // 监听表单变化，触发自动保存
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    
    autoSaveTimer.current = setTimeout(() => {
      autoSave()
    }, 500) // 500ms 防抖

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [taskName, hours, reflection, weeklyGoalId, date, supabase, weeklyGoals])

  // 组件挂载时恢复草稿
  useEffect(() => {
    const draft = localStorage.getItem('task_draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        setDate(draftData.date || format(new Date(), 'yyyy-MM-dd'))
        setTaskName(draftData.taskName || '')
        setHours(draftData.hours || '')
        setReflection(draftData.reflection || '')
        setWeeklyGoalId(draftData.weeklyGoalId || '')
        setLastSaved(draftData.timestamp ? new Date(draftData.timestamp) : null)
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      // 根据选择的目标确定任务分类
      let taskCategory = taskName.trim()
      const selectedWeeklyGoalId = weeklyGoalId || null

      // 如果选择了目标，使用目标的分类
      if (weeklyGoalId) {
        const selectedGoal = weeklyGoals.find(goal => goal.id === weeklyGoalId)
        if (selectedGoal) {
          taskCategory = selectedGoal.task_category
        }
      }

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        task_name: taskName,
        task_category: taskCategory,
        hours: parseFloat(hours),
        date: date,
        reflection: reflection || null,
        weekly_goal_id: selectedWeeklyGoalId,
      })

      if (error) throw error

      // Reset form and clear draft
      setTaskName('')
      setHours('')
      setReflection('')
      setWeeklyGoalId('')
      setLastSaved(null)
      localStorage.removeItem('task_draft')

      onTaskAdded?.()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('添加任务失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 bg-white/0 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">记录今日任务</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">日期</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">任务名称</label>
        <Input
          type="text"
          placeholder="例如：学习英语、完成项目报告"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
      </div>



      <div className="space-y-2">
        <label className="text-sm font-medium">花费时间（小时）</label>
        <Input
          type="number"
          step="0.5"
          min="0.5"
          placeholder="请输入花费的小时数"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">选择目标分类（可选）</label>
        <select
          value={weeklyGoalId}
          onChange={(e) => setWeeklyGoalId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">不属于任何目标分类</option>
          {weeklyGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.task_category}（目标: {goal.target_hours}小时）
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">反思总结（可选）</label>
        <Textarea
          placeholder="记录今天的收获、遇到的困难、改进建议等"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
        />
      </div>

      {/* 自动保存状态指示器 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
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
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? '保存中...' : '保存任务'}
      </Button>
    </form>
  )
}