'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

interface TaskFormProps {
  onTaskAdded?: () => void
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [taskName, setTaskName] = useState('')
  const [hours, setHours] = useState('')
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      // Use task name as category directly
      const taskCategory = taskName.trim()

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        task_name: taskName,
        task_category: taskCategory,
        hours: parseFloat(hours),
        date: date,
        reflection: reflection || null,
      })

      if (error) throw error

      // Reset form
      setTaskName('')
      setHours('')
      setReflection('')

      onTaskAdded?.()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('添加任务失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 bg-white p-6 rounded-lg shadow-lg">
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