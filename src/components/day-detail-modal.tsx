'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Clock, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  task_name: string
  task_category: string
  hours: number
  date: string
  reflection: string | null
  created_at: string
}

interface DayDetailModalProps {
  date: Date | null
  tasks: Task[]
  onClose: () => void
}

export function DayDetailModal({ date, tasks, onClose }: DayDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (date) {
      setIsVisible(true)
    }
  }, [date])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 150) // 等待动画完成
  }

  if (!date) return null

  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden transform transition-all duration-150 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {format(date, 'yyyy年MM月dd日')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(date, 'EEEE')} • {tasks.length} 个任务 • 总计 {totalHours} 小时
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">这一天还没有任务记录</p>
              <p className="text-gray-400 text-sm mt-2">点击添加任务来开始记录吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {task.task_name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{task.hours} 小时</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{task.task_category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>创建时间: {format(new Date(task.created_at), 'HH:mm')}</span>
                    </div>
                  </div>

                  {task.reflection && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">反思总结</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {task.reflection}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* 底部统计 */}
              <div className="mt-6 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">当日汇总</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">任务数量：</span>
                    <span className="font-semibold text-gray-900">{tasks.length} 个</span>
                  </div>
                  <div>
                    <span className="text-gray-600">总时长：</span>
                    <span className="font-semibold text-gray-900">{totalHours} 小时</span>
                  </div>
                </div>
                
                {tasks.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-600">分类统计：</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Array.from(new Set(tasks.map(t => t.task_category))).map(category => {
                        const categoryHours = tasks
                          .filter(t => t.task_category === category)
                          .reduce((sum, t) => sum + t.hours, 0)
                        return (
                          <span 
                            key={category}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border border-gray-200"
                          >
                            {category}: {categoryHours}h
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}