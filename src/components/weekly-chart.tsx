'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Task {
  id: string
  task_name: string
  task_category: string
  hours: number
  date: string
}

interface ChartData {
  date: string
  day: string
  [key: string]: string | number
}

export function WeeklyChart() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart = startOfWeek(currentWeek)
      const weekEnd = endOfWeek(currentWeek)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [currentWeek, supabase])

  const processChartData = useCallback(() => {
    const weekStart = startOfWeek(currentWeek)
    const weekEnd = endOfWeek(currentWeek)
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Group tasks by category
    const categories = Array.from(new Set(tasks.map(task => task.task_category)))
    
    const data = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTasks = tasks.filter(task => task.date === dayStr)
      
      const dayData: ChartData = {
        date: format(day, 'MM/dd'),
        day: format(day, 'EEE'),
      }

      // Initialize all categories with 0
      categories.forEach(category => {
        dayData[category] = 0
      })

      // Sum hours for each category
      dayTasks.forEach(task => {
        dayData[task.task_category] = (dayData[task.task_category] as number || 0) + task.hours
      })

      return dayData
    })

    setChartData(data)
  }, [currentWeek, tasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    processChartData()
  }, [processChartData])

  const getCategories = () => {
    return Array.from(new Set(tasks.map(task => task.task_category)))
  }

  const getLineColors = () => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
    ]
    return colors
  }

  const categories = getCategories()
  const colors = getLineColors()

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(startOfWeek(currentWeek), 'MM/dd')} - {format(endOfWeek(currentWeek), 'MM/dd')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, -1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">加载中...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg text-gray-500">本周暂无数据</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: '小时', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  `${value}小时`,
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={category}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && categories.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">本周数据概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const categoryTasks = tasks.filter(task => task.task_category === category)
              const totalHours = categoryTasks.reduce((sum, task) => sum + task.hours, 0)
              
              return (
                <div key={category} className="space-y-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-gray-600">{totalHours} 小时</div>
                  <div className="text-xs text-gray-500">
                    {categoryTasks.length} 个任务
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}