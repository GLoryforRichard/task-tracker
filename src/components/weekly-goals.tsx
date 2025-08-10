'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface WeeklyGoal {
  id: string
  task_category: string
  target_hours: number
  week_start: string
  current_hours: number
}

interface CategoryStats {
  category: string
  current_hours: number
  target_hours: number
}

export function WeeklyGoals() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newTargetHours, setNewTargetHours] = useState('')
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const fetchGoalsAndStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart = format(currentWeek, 'yyyy-MM-dd')
      const weekEnd = format(addWeeks(currentWeek, 1), 'yyyy-MM-dd')

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)

      if (goalsError) throw goalsError

      // Fetch actual task hours for this week - 包括关联到weekly_goal_id的任务
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('task_category, hours, weekly_goal_id')
        .eq('user_id', user.id)
        .gte('date', weekStart)
        .lt('date', weekEnd)

      if (tasksError) throw tasksError

      // Calculate current hours for each category
      const categoryHours: { [key: string]: number } = {}
      tasksData?.forEach(task => {
        categoryHours[task.task_category] = (categoryHours[task.task_category] || 0) + task.hours
      })

      // Merge goals with actual hours
      const mergedGoals = (goalsData || []).map(goal => ({
        ...goal,
        current_hours: categoryHours[goal.task_category] || 0
      }))

      setGoals(mergedGoals)

      // Only show categories that have explicit goals set
      const stats = mergedGoals.map(goal => ({
        category: goal.task_category,
        current_hours: goal.current_hours,
        target_hours: goal.target_hours
      }))

      setCategoryStats(stats)
    } catch (error) {
      console.error('Error fetching goals and stats:', error)
    } finally {
      setLoading(false)
    }
  }, [currentWeek, supabase])

  useEffect(() => {
    fetchGoalsAndStats()
  }, [fetchGoalsAndStats])

  const addGoal = async () => {
    if (!newCategory || !newTargetHours) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('weekly_goals').insert({
        user_id: user.id,
        task_category: newCategory,
        target_hours: parseFloat(newTargetHours),
         week_start: format(currentWeek, 'yyyy-MM-dd'),
      })

      if (error) throw error

      setNewCategory('')
      setNewTargetHours('')
      fetchGoalsAndStats()
    } catch (error) {
      console.error('Error adding goal:', error)
      alert('添加目标失败，请重试')
    }
  }

  const updateGoal = async (id: string, target_hours: number) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({ target_hours })
        .eq('id', id)

      if (error) throw error
      fetchGoalsAndStats()
    } catch (error) {
      console.error('Error updating goal:', error)
      alert('更新目标失败，请重试')
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchGoalsAndStats()
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('删除目标失败，请重试')
    }
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy年MM月dd日')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MM月dd日')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, -1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">添加新目标</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">任务类别</label>
            <Input
              placeholder="例如：学习、工作、运动"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-sm font-medium">目标小时</label>
            <Input
              type="number"
              placeholder="小时"
              value={newTargetHours}
              onChange={(e) => setNewTargetHours(e.target.value)}
            />
          </div>
          <Button onClick={addGoal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">本周目标</h3>
        
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : categoryStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无目标，请添加新目标</div>
        ) : (
          <div className="space-y-4">
            {categoryStats.map((stat) => {
              const goal = goals.find(g => g.task_category === stat.category)
              const percentage = stat.target_hours > 0 
                ? Math.min((stat.current_hours / stat.target_hours) * 100, 100) 
                : 0

              return (
                <div key={stat.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{stat.category}</h4>
                    <div className="text-sm text-gray-600">
                      {stat.current_hours}/{stat.target_hours} 小时
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stat.current_hours, stat.target_hours)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{Math.round(percentage)}% 完成</div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        className="w-20 h-8 text-sm"
                        value={stat.target_hours}
                        onChange={(e) => {
                          const newHours = parseFloat(e.target.value)
                          if (goal && !isNaN(newHours)) {
                            updateGoal(goal.id, newHours)
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => goal && deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}