import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 to-indigo-100/90">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
              {/* 大版小狗图标 */}
              <div className="relative">
                {/* 耳朵 */}
                <div className="absolute -top-2 -left-2 w-4 h-6 bg-purple-600 rounded-full transform rotate-12"></div>
                <div className="absolute -top-2 -right-2 w-4 h-6 bg-purple-600 rounded-full transform -rotate-12"></div>
                
                {/* 脸部 */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  {/* 眼睛 */}
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                  {/* 鼻子 */}
                  <div className="absolute bottom-2 w-1 h-1 bg-pink-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 mb-6">
            PuppyHabits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            🐶 跟随小狗一起培养好习惯，记录你的任务，追踪你的时间，让每一天都更加高效
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                开始记录
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                注册账户
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">记录任务</h3>
            <p className="text-gray-600">
              轻松记录每个任务的详细信息和花费的时间
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">日历视图</h3>
            <p className="text-gray-600">
              在日历中直观查看每天的任务和时间分配
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">数据分析</h3>
            <p className="text-gray-600">
              通过图表分析你的时间使用效率和趋势
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">设定目标，持续进步</h2>
            <p className="text-gray-600 mb-6">
              为每个任务类别设定每周目标，追踪进度，保持动力
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Target className="w-5 h-5" />
              <span className="font-medium">学习 30/40 小时</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
