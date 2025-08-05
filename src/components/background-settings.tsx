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
  const [isApplying, setIsApplying] = useState(false)
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

  const clearPreviousBackgrounds = () => {
    // 清理之前的背景图片缓存
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('website-background') && localStorage.getItem(key)?.includes('data:image')) {
        localStorage.removeItem(key)
      }
    })
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 计算压缩后的尺寸，限制最大宽度为1920px
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height)
        
        // 输出为JPEG格式，质量0.8
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        // 检查压缩后的大小，如果还是太大就降低质量
        if (compressedDataUrl.length > 1024 * 1024) { // 1MB
          const finalDataUrl = canvas.toDataURL('image/jpeg', 0.6)
          resolve(finalDataUrl)
        } else {
          resolve(compressedDataUrl)
        }
      }
      
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 检查文件大小 (限制为15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert('图片文件不能超过15MB')
        return
      }

      try {
        // 清理之前的背景缓存
        clearPreviousBackgrounds()
        
        // 压缩图片
        const compressedImage = await compressImage(file)
        setSelectedImage(compressedImage)
        
        // 检查压缩后的大小
        const sizeInMB = (compressedImage.length * 0.75 / 1024 / 1024).toFixed(2)
        console.log(`图片压缩完成，大小: ${sizeInMB}MB`)
        
      } catch (error) {
        console.error('Image compression failed:', error)
        alert('图片处理失败，请重试或选择其他图片')
      }
    }
    // 清除文件输入框的值，允许重复选择同一文件
    event.target.value = ''
  }

  const applyBackground = (backgroundValue: string | null) => {
    try {
      if (backgroundValue) {
        // 检查localStorage容量
        if (backgroundValue.includes('data:image')) {
          const sizeInBytes = new Blob([backgroundValue]).size
          const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2)
          console.log(`尝试存储背景，大小: ${sizeInMB}MB`)
          
          if (sizeInBytes > 2 * 1024 * 1024) { // 2MB
            throw new Error('图片太大，请选择更小的图片')
          }
        }
        
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
    } catch (error) {
      console.error('Failed to apply background:', error)
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // localStorage容量超限
        alert('存储空间不足，请清理浏览器缓存或选择更小的图片')
        // 尝试清理所有背景缓存
        Object.keys(localStorage).forEach(key => {
          if (key.includes('background')) {
            localStorage.removeItem(key)
          }
        })
      } else {
        alert(error instanceof Error ? error.message : '应用背景失败')
      }
      throw error
    }
  }

  const handleApplyImage = async () => {
    if (selectedImage && !isApplying) {
      setIsApplying(true)
      try {
        const imageUrl = `url(${selectedImage})`
        applyBackground(imageUrl)
        setSelectedImage(null)
        // 显示成功反馈
        const button = document.activeElement as HTMLButtonElement
        if (button) {
          const originalText = button.textContent
          button.textContent = '应用成功!'
          button.className = button.className.replace('bg-blue-600', 'bg-green-600')
          setTimeout(() => {
            if (button.textContent === '应用成功!') {
              button.textContent = originalText
              button.className = button.className.replace('bg-green-600', 'bg-blue-600')
            }
          }, 2000)
        }
      } catch (error) {
        console.error('Error applying background:', error)
        alert('应用背景失败，请重试')
      } finally {
        setTimeout(() => setIsApplying(false), 1000)
      }
    }
  }

  const handleReset = () => {
    applyBackground(null)
    setSelectedImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  <p className="text-sm text-gray-400">支持 JPG、PNG 格式，文件大小不超过 15MB<br/>图片将自动压缩优化以节省存储空间</p>
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
                    <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">预览效果</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleApplyImage} 
                    disabled={isApplying}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isApplying ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        应用中...
                      </div>
                    ) : (
                      '应用此背景'
                    )}
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
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${
                    currentBackground === bg.value
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => {
                    applyBackground(bg.value)
                    // 简单的点击反馈
                    const element = document.activeElement as HTMLElement
                    if (element) {
                      element.style.transform = 'scale(0.95)'
                      setTimeout(() => {
                        element.style.transform = ''
                      }, 150)
                    }
                  }}
                >
                  <div
                    className="h-20 w-full"
                    style={{ background: bg.preview }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
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
            className="flex items-center space-x-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span>重置为默认</span>
          </Button>
          <div className="text-sm text-gray-500">
            背景设置会保存在本地浏览器中，自动压缩优化
          </div>
        </div>
      </div>
    </div>
  )
}