'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { useAutoSave } from '@/hooks/use-auto-save'
import { createClient } from '@/utils/supabase/client'
import { Save, FileText, Trash2, Plus, Edit3 } from 'lucide-react'
import { format } from 'date-fns'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  
  const supabase = createClient()

  // 自动保存hook
  const { autoSaving, lastSaved, clearDraft, loadDraft } = useAutoSave({
    key: currentNote ? `note_draft_${currentNote.id}` : 'new_note_draft',
    data: { title, content },
    enabled: isEditing
  })

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

  const fetchNotes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 先检查表是否存在，如果不存在则创建
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        // 如果表不存在，创建表
        if (error.message.includes('relation "notes" does not exist')) {
          console.log('Notes table does not exist, creating...')
          // 这里我们只是记录日志，实际的表创建需要在Supabase后台完成
          setNotes([])
          return
        }
        throw error
      }

      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    }
  }, [supabase])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  // 组件挂载时恢复草稿
  useEffect(() => {
    if (isEditing && !currentNote) {
      // 新建笔记时加载草稿
      const draftData = loadDraft()
      if (draftData) {
        setTitle(draftData.title || '')
        setContent(draftData.content || '')
      }
    }
  }, [isEditing, currentNote, loadDraft])

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请输入标题和内容')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      if (currentNote) {
        // 更新现有笔记
        const { error } = await supabase
          .from('notes')
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentNote.id)

        if (error) throw error
      } else {
        // 创建新笔记
        const { error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
          })

        if (error) throw error
      }

      await fetchNotes()
      setIsEditing(false)
      clearDraft() // 保存成功后清除草稿
      alert('笔记保存成功！')
    } catch (error) {
      console.error('Error saving note:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!window.confirm('确定要删除这条笔记吗？')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      await fetchNotes()
      if (currentNote?.id === noteId) {
        setCurrentNote(null)
        setTitle('')
        setContent('')
        setIsEditing(false)
      }
      clearDraft() // 删除成功后清除草稿
      alert('笔记删除成功！')
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('删除失败，请重试')
    }
  }

  const selectNote = (note: Note) => {
    setCurrentNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }

  const startNewNote = () => {
    setCurrentNote(null)
    setTitle('')
    setContent('')
    setIsEditing(true)
    // 新建笔记时清除草稿
    clearDraft()
  }

  const startEdit = () => {
    setIsEditing(true)
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
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 mb-2">
            📝 近期要事笔记
          </h1>
          <p className="text-gray-600">记录重要事项，随时查看和编辑</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 笔记列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的笔记</h2>
                <Button
                  onClick={startNewNote}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新建
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>还没有笔记</p>
                    <p className="text-sm">点击&ldquo;新建&rdquo;开始记录</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        currentNote?.id === note.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => selectNote(note)}
                    >
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {note.content.replace(/\n/g, ' ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.updated_at), 'MM/dd HH:mm')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          className="text-red-500 hover:bg-red-100 p-1 h-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 编辑器 */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              {currentNote || isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {currentNote ? '编辑笔记' : '新建笔记'}
                        </span>
                      </div>
                      {isEditing && (
                        <AutoSaveIndicator autoSaving={autoSaving} lastSaved={lastSaved} className="mt-1" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentNote && !isEditing && (
                        <Button
                          onClick={startEdit}
                          variant="outline"
                          size="sm"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                      )}
                      {isEditing && (
                        <Button
                          onClick={saveNote}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {saving ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              保存中...
                            </div>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="输入标题..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full text-2xl font-bold border-none outline-none bg-transparent placeholder-gray-400 ${
                        isEditing ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <textarea
                      placeholder="开始记录你的想法..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full h-96 resize-none border-none outline-none bg-transparent placeholder-gray-400 leading-relaxed ${
                        isEditing ? 'text-gray-900' : 'text-gray-700'
                      }`}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileText className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    选择一条笔记或创建新笔记
                  </h3>
                  <p className="text-gray-600 mb-6">
                    在左侧选择现有笔记进行查看，或创建新的笔记开始记录
                  </p>
                  <Button
                    onClick={startNewNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一条笔记
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}