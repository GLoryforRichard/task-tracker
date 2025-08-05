'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, RotateCcw, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackgroundSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function BackgroundSettings({ isOpen, onClose }: BackgroundSettingsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentBackground, setCurrentBackground] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 预设背景选项
  const presetBackgrounds = [
    {
      name: '默认',
      value: null,
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: '海洋蓝',
      value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      preview: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
    },
    {
      name: '森林绿',
      value: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
      preview: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
    },
    {
      name: '日落橙',
      value: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
      preview: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
    },
    {
      name: '紫色梦境',
      value: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      preview: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)'
    },
    {
      name: '温暖黄昏',
      value: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      preview: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
    }
  ]

  useEffect(() => {
    // 加载当前背景设置
    const savedBackground = localStorage.getItem('website-background')
    setCurrentBackground(savedBackground)
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 检查文件大小 (限制为5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片文件不能超过5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setSelectedImage(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const applyBackground = (backgroundValue: string | null) => {
    if (backgroundValue) {
      localStorage.setItem('website-background', backgroundValue)
      document.body.style.background = backgroundValue
      document.body.style.backgroundSize = backgroundValue.startsWith('url(') ? 'cover' : 'auto'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundAttachment = 'fixed'
    } else {
      localStorage.removeItem('website-background')
      document.body.style.background = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.backgroundAttachment = ''
    }
    setCurrentBackground(backgroundValue)
  }

  const handleApplyImage = () => {
    if (selectedImage) {
      const imageUrl = `url(${selectedImage})`
      applyBackground(imageUrl)
      setSelectedImage(null)
    }
  }

  const handleReset = () => {
    applyBackground(null)
    setSelectedImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">背景设置</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          
          {/* 自定义上传 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">自定义背景图片</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-gray-600">点击上传背景图片</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG 格式，文件大小不超过 5MB</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  选择图片
                </Button>
              </div>

              {selectedImage && (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="预览"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">预览效果</span>
                    </div>
                  </div>
                  <Button onClick={handleApplyImage} className="w-full">
                    应用此背景
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 预设背景 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">预设背景</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetBackgrounds.map((bg) => (
                <div
                  key={bg.name}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    currentBackground === bg.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => applyBackground(bg.value)}
                >
                  <div
                    className="h-20 w-full"
                    style={{ background: bg.preview }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{bg.name}</span>
                  </div>
                  {currentBackground === bg.value && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>重置为默认</span>
          </Button>
          <div className="text-sm text-gray-500">
            背景设置会保存在本地浏览器中
          </div>
        </div>
      </div>
    </div>
  )
}