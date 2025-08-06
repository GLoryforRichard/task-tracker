'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Calendar, Target, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface Plan {
  id: string
  title: string
  start_date: string
  end_date: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

interface PlanItem {
  id: string
  plan_id: string
  title: string
  description: string | null
  date: string
  completed: boolean
  created_at: string
  updated_at: string
}

export default function PlanPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showPlanEditor, setShowPlanEditor] = useState(false)
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

  const fetchPlans = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message.includes('relation "plans" does not exist')) {
          console.log('Plans table does not exist')
          setPlans([])
          return
        }
        throw error
      }

      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      setPlans([])
    }
  }, [supabase])

  const fetchPlanItems = useCallback(async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('plan_items')
        .select('*')
        .eq('plan_id', planId)
        .order('date', { ascending: true })

      if (error) {
        if (error.message.includes('relation "plan_items" does not exist')) {
          console.log('Plan items table does not exist')
          setPlanItems([])
          return
        }
        throw error
      }

      setPlanItems(data || [])
    } catch (error) {
      console.error('Error fetching plan items:', error)
      setPlanItems([])
    }
  }, [supabase])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  useEffect(() => {
    if (user) {
      fetchPlans()
    }
  }, [user, fetchPlans])

  // useEffect(() => {
  //   // 检查URL参数是否有指定的日期范围
  //   const startDate = searchParams.get('start')
  //   const endDate = searchParams.get('end')
  //   
  //   if (startDate && endDate) {
  //     // 如果有日期参数，显示创建计划界面
  //     setShowCreatePlan(true)
  //   }
  // }, [searchParams])

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    fetchPlanItems(plan.id)
    setShowPlanEditor(true)
  }

  const getStatusColor = (status: Plan['status']) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: Plan['status']) => {
    switch (status) {
      case 'planning': return '计划中'
      case 'in_progress': return '进行中'
      case 'completed': return '已完成'
      case 'cancelled': return '已取消'
      default: return '未知'
    }
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
            🎯 明确计划
          </h1>
          <p className="text-gray-600">制定具体的计划，按日期安排任务和目标</p>
        </div>

        {showCreatePlan ? (
          <CreatePlanForm
            onSuccess={() => {
              setShowCreatePlan(false)
              fetchPlans()
            }}
            onCancel={() => setShowCreatePlan(false)}
            defaultStartDate={null}
            defaultEndDate={null}
          />
        ) : showPlanEditor && selectedPlan ? (
          <PlanEditor
            plan={selectedPlan}
            items={planItems}
            onUpdate={() => {
              fetchPlans()
              fetchPlanItems(selectedPlan.id)
            }}
            onClose={() => {
              setShowPlanEditor(false)
              setSelectedPlan(null)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 计划列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">我的计划</h2>
                  <Button
                    onClick={() => setShowCreatePlan(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {plans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>还没有计划</p>
                      <p className="text-sm">点击&ldquo;新建&rdquo;开始制定</p>
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedPlan?.id === plan.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => selectPlan(plan)}
                      >
                        <h3 className="font-medium text-gray-900 truncate mb-1">
                          {plan.title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {format(parseISO(plan.start_date), 'MM/dd')} - {format(parseISO(plan.end_date), 'MM/dd')}
                        </p>
                        {plan.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 欢迎界面 */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <div className="text-center py-20">
                  <Target className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    选择一个计划或创建新计划
                  </h3>
                  <p className="text-gray-600 mb-6">
                    在左侧选择现有计划进行管理，或创建新的计划开始规划
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={() => setShowCreatePlan(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      创建新计划
                    </Button>
                    <Button
                      onClick={() => setShowCreatePlan(true)}
                      variant="outline"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      按日期计划
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface CreatePlanFormProps {
  onSuccess: () => void
  onCancel: () => void
  defaultStartDate?: string | null
  defaultEndDate?: string | null
}

function CreatePlanForm({ onSuccess, onCancel, defaultStartDate, defaultEndDate }: CreatePlanFormProps) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(defaultStartDate || format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(defaultEndDate || format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const savePlan = async () => {
    if (!title.trim() || !startDate || !endDate) {
      alert('请填写完整信息')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const { error } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          title: title.trim(),
          start_date: startDate,
          end_date: endDate,
          description: description.trim(),
          status: 'planning'
        })

      if (error) throw error

      onSuccess()
      alert('计划创建成功！')
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('创建失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">创建新计划</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">计划标题</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入计划标题..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">计划描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个计划的目标和内容..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            取消
          </Button>
          <Button
            onClick={savePlan}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? '创建中...' : '创建计划'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PlanEditorProps {
  plan: Plan
  items: PlanItem[]
  onUpdate: () => void
  onClose: () => void
}

function PlanEditor({ plan, items, onUpdate, onClose }: PlanEditorProps) {
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDate, setNewItemDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showAddItem, setShowAddItem] = useState(false)
  const supabase = createClient()

  const addPlanItem = async () => {
    if (!newItemTitle.trim()) {
      alert('请输入任务标题')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const { error } = await supabase
        .from('plan_items')
        .insert({
          plan_id: plan.id,
          title: newItemTitle.trim(),
          date: newItemDate,
          completed: false
        })

      if (error) throw error

      setNewItemTitle('')
      setShowAddItem(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding plan item:', error)
      alert('添加失败，请重试')
    }
  }

  const toggleItemComplete = async (item: PlanItem) => {
    try {
      const { error } = await supabase
        .from('plan_items')
        .update({ completed: !item.completed })
        .eq('id', item.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error updating plan item:', error)
      alert('更新失败，请重试')
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!window.confirm('确定要删除这个任务吗？')) return

    try {
      const { error } = await supabase
        .from('plan_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error deleting plan item:', error)
      alert('删除失败，请重试')
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{plan.title}</h2>
          <p className="text-gray-600">
            {format(parseISO(plan.start_date), 'yyyy年MM月dd日')} - {format(parseISO(plan.end_date), 'yyyy年MM月dd日')}
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          关闭
        </Button>
      </div>

      {plan.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{plan.description}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">计划任务</h3>
          <Button
            onClick={() => setShowAddItem(!showAddItem)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加任务
          </Button>
        </div>

        {showAddItem && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="输入任务标题..."
            />
            <div className="flex items-center space-x-3">
              <Input
                type="date"
                value={newItemDate}
                onChange={(e) => setNewItemDate(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addPlanItem} size="sm">
                添加
              </Button>
              <Button onClick={() => setShowAddItem(false)} variant="outline" size="sm">
                取消
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>还没有任务</p>
              <p className="text-sm">点击&ldquo;添加任务&rdquo;开始制定具体计划</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleItemComplete(item)}
                  className="flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(parseISO(item.date), 'MM月dd日')}
                  </div>
                </div>

                <Button
                  onClick={() => deleteItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}