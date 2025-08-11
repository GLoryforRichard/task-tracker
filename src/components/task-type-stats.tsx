'use client'

import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { createClient } from '@/utils/supabase/client'

interface TaskTypeStats {
  task_type: string
  total_hours: number
  task_count: number
}

interface TaskTypeStatsProps {
  refreshTrigger?: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function TaskTypeStats({ refreshTrigger }: TaskTypeStatsProps) {
  const [stats, setStats] = useState<TaskTypeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie')
  
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 获取按类型分组的统计数据
      const { data, error } = await supabase
        .from('tasks')
        .select('task_type, hours')
        .eq('user_id', user.id)
        .not('task_type', 'is', null)

      if (error) throw error

      // 手动聚合数据
      const statsMap: { [key: string]: { total_hours: number; task_count: number } } = {}
      
      data?.forEach((task) => {
        const type = task.task_type || '未分类'
        if (!statsMap[type]) {
          statsMap[type] = { total_hours: 0, task_count: 0 }
        }
        statsMap[type].total_hours += task.hours
        statsMap[type].task_count += 1
      })

      const formattedStats = Object.entries(statsMap).map(([task_type, data]) => ({
        task_type,
        total_hours: data.total_hours,
        task_count: data.task_count
      })).sort((a, b) => b.total_hours - a.total_hours)

      setStats(formattedStats)
    } catch (error) {
      console.error('Error fetching task type stats:', error)
      setStats([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshTrigger])

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    if (wholeHours === 0) {
      return `${minutes}分钟`
    } else if (minutes === 0) {
      return `${wholeHours}小时`
    } else {
      return `${wholeHours}小时${minutes}分钟`
    }
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.task_type}</p>
          <p className="text-sm text-gray-600">时长: {formatTime(data.total_hours)}</p>
          <p className="text-sm text-gray-600">任务数: {data.task_count}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">任务类型统计</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">暂无任务类型数据</p>
          <p className="text-sm text-gray-400 mt-1">添加任务时选择类型即可查看统计</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">任务类型统计</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            饼图
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            柱图
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 图表区域 */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'pie' ? (
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ task_type, percent }) => `${task_type} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_hours"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            ) : (
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="task_type" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: '小时', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={customTooltip} />
                <Bar dataKey="total_hours" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 详细列表 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">详细统计</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {stats.map((stat, index) => (
              <div 
                key={stat.task_type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{stat.task_type}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-600">
                    {formatTime(stat.total_hours)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.task_count} 个任务
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 总计 */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between font-semibold">
              <span>总计</span>
              <div className="text-right">
                <div className="text-blue-600">
                  {formatTime(stats.reduce((sum, stat) => sum + stat.total_hours, 0))}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.reduce((sum, stat) => sum + stat.task_count, 0)} 个任务
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}