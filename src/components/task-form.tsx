'use client'

import { useState, useEffect } from 'react'
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

      // Reset form
      setTaskName('')
      setHours('')
      setReflection('')
      setWeeklyGoalId('')

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