# Task Tracker

任务时间追踪器 - 一个基于 Next.js 15 和 Supabase 的现代化任务管理应用。

## 🚀 部署状态

![Vercel](https://img.shields.io/badge/vercel-deployed-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![Supabase](https://img.shields.io/badge/Supabase-SSR-green)

## 📋 功能特性

- **用户认证** - 完整的注册/登录系统
- **任务记录** - 记录任务名称、时间、反思
- **日历视图** - 直观的月历展示
- **数据分析** - 每周任务时间统计图表
- **目标管理** - 设置和跟踪每周目标

## 🛠 技术栈

- **前端**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **后端**: Supabase (PostgreSQL + Auth)
- **图表**: Recharts
- **部署**: Vercel

## 🏃‍♂️ 快速开始

1. 克隆项目
```bash
git clone https://github.com/GLoryforRichard/task-tracker.git
cd task-tracker
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
# 填入你的 Supabase 配置
```

4. 运行开发服务器
```bash
npm run dev
```

## 📚 更多信息

查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 了解数据库配置详情。

## 🔧 开发说明

此项目已修复所有 ESLint 错误，完全兼容 Vercel 部署环境。