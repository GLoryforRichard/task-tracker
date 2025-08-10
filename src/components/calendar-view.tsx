'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parse } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DayDetailModal } from '@/components/day-detail-modal'
import { createClient } from '@/utils/supabase/client'

interface Task {
  id: string
  task_name: string
  task_category: string
  hours: number
  date: string
  reflection: string | null
  created_at: string
}

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }, [currentDate, supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => isSameDay(parse(task.date, 'yyyy-MM-dd', new Date()), date))
  }

  const getTotalHoursForDay = (date: Date) => {
    const dayTasks = getTasksForDay(date)
    return dayTasks.reduce((total, task) => total + task.hours, 0)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const handleCloseModal = () => {
    setSelectedDate(null)
  }

  const days = getDaysInMonth()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'yyyy年MM月')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-white rounded-lg shadow-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 font-semibold bg-gray-50">
            {day}
          </div>
        ))}

        {days.map(day => {
          const tasksForDay = getTasksForDay(day)
          const totalHours = getTotalHoursForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toString()}
              className={`
                min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-blue-50
                ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                ${isSameDay(day, new Date()) ? 'bg-blue-100' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              
              {totalHours > 0 && (
                <div className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
                  {totalHours}h
                </div>
              )}

              <div className="mt-1 space-y-0.5">
                {tasksForDay.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className="text-xs truncate bg-gray-100 px-1 py-0.5 rounded"
                    title={task.task_name}
                  >
                    {task.task_name}
                  </div>
                ))}
                {tasksForDay.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{tasksForDay.length - 2}更多
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 日期详情弹窗 */}
      <DayDetailModal 
        date={selectedDate}
        tasks={selectedDate ? getTasksForDay(selectedDate) : []}
        onClose={handleCloseModal}
      />
    </div>
  )
}