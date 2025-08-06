'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

interface Task {
  id: string
  task_name: string
  task_category: string
  hours: number
  date: string
  reflection: string | null
  created_at: string
  categoryTotal?: number // 类别总耗时
}

interface TaskHistoryProps {
  refreshTrigger?: number
}

export function TaskHistory({ refreshTrigger }: TaskHistoryProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [totalHours, setTotalHours] = useState(0)
  
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10) // 显示最近10条记录

      if (error) throw error
      
      // 获取每个任务类别的总耗时
      const { data: categoryData, error: categoryError } = await supabase
        .from('tasks')
        .select('task_category, hours')
        .eq('user_id', user.id)
      
      if (categoryError) throw categoryError
      
      // 计算每个类别的总时间
      const categoryTotals: { [key: string]: number } = {}
      categoryData?.forEach(task => {
        categoryTotals[task.task_category] = (categoryTotals[task.task_category] || 0) + task.hours
      })
      
      // 为每个任务添加类别总耗时
      const tasksWithTotals = (data || []).map(task => ({
        ...task,
        categoryTotal: categoryTotals[task.task_category] || 0
      }))
      
      setTasks(tasksWithTotals)
      
      // 计算总时长
      const total = (data || []).reduce((sum, task) => sum + task.hours, 0)
      setTotalHours(total)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这条任务记录吗？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      // 重新获取任务列表
      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('删除失败，请重试')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshTrigger])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
      {/* 统计信息 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">任务记录汇总</h2>
        <div className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">总记录数：</span>
              <span className="font-semibold">{tasks.length} 条</span>
            </div>
            <div>
              <span className="text-gray-600">总时长：</span>
              <span className="font-semibold">{totalHours} 小时</span>
            </div>
          </div>
        </div>
      </div>

      {/* 任务记录列表 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近记录</h3>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            还没有任务记录，快去添加第一条记录吧！
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* 表头 */}
                               <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gray-50/40 backdrop-blur-sm rounded-t-lg border-b text-sm font-medium text-gray-600">
              <div>日期</div>
              <div>任务名称</div>
              <div>时长</div>
              <div>分类</div>
              <div>总耗时</div>
              <div>操作</div>
            </div>
            
            {/* 任务列表 */}
            <div className="max-h-96 overflow-y-auto">
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                                          className={`grid grid-cols-6 gap-4 py-3 px-4 border-b border-gray-100 hover:bg-gray-50/30 transition-colors ${
                          index % 2 === 0 ? 'bg-white/20' : 'bg-gray-50/30'
                        }`}
                >
                  <div className="text-sm text-gray-600">
                    {format(new Date(task.date), 'MM/dd')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {task.task_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {task.hours} 小时
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {task.task_category}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">{task.categoryTotal}</span> 小时
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      title="删除记录"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 底部汇总 */}
                               <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gray-100/40 backdrop-blur-sm rounded-b-lg border-t font-medium text-sm">
              <div className="text-gray-600">总计</div>
              <div className="text-gray-600">{tasks.length} 条记录</div>
              <div className="text-gray-900">{totalHours} 小时</div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}