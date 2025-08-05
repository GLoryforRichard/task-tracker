# 任务时间追踪器

一个基于 Next.js 15、TailwindCSS、shadcn/ui 和 Supabase 的任务时间追踪应用。

## 功能特点

- 📊 **任务记录**：记录任务名称、时间、反思
- 📅 **日历视图**：类似 Google Calendar 的月历展示
- 📈 **数据分析**：每周任务时间统计图表
- 🎯 **目标管理**：设置每周目标并跟踪进度
- 🔐 **用户认证**：完整的注册登录系统

## 技术栈

- **前端**：Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **图表**：Recharts
- **后端**：Supabase (PostgreSQL + Auth)
- **日期处理**：date-fns

## 项目结构

```
src/
├── app/
│   ├── dashboard/          # 任务录入页面
│   ├── calendar/          # 日历视图页面
│   ├── charts/            # 数据分析页面
│   ├── goals/             # 目标设置页面
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   └── page.tsx           # 首页 (landing page)
├── components/
│   ├── layout/
│   │   └── navbar.tsx     # 导航栏
│   ├── ui/                # shadcn/ui 组件
│   ├── task-form.tsx      # 任务表单
│   ├── calendar-view.tsx  # 日历组件
│   ├── weekly-chart.tsx   # 图表组件
│   └── weekly-goals.tsx   # 目标组件
├── lib/
│   ├── supabase.ts        # Supabase 客户端
│   ├── supabase-server.ts # 服务端 Supabase
│   ├── database.types.ts  # 数据库类型
│   └── utils.ts           # 工具函数
└── middleware.ts          # 认证中间件
```

## 快速开始

### 1. 克隆项目

```bash
git clone [repository-url]
cd task-tracker
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Supabase

1. 访问 [Supabase](https://supabase.com) 创建项目
2. 运行 `SUPABASE_SETUP.md` 中的 SQL 脚本设置数据库
3. 创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 开始使用

## 页面说明

### 未登录用户
- **首页**：展示应用功能，提供注册/登录入口

### 已登录用户
- **Dashboard**：中央任务录入界面
- **日历**：月历视图展示每日任务
- **图表**：每周任务时间统计图表
- **目标**：设置和管理每周目标

## 数据库结构

### 任务表 (tasks)
- id: UUID (主键)
- user_id: UUID (外键)
- task_name: 任务名称
- task_category: 任务类别
- hours: 花费时间
- date: 日期
- reflection: 反思总结
- created_at/updated_at: 时间戳

### 每周目标表 (weekly_goals)
- id: UUID (主键)
- user_id: UUID (外键)
- task_category: 任务类别
- target_hours: 目标小时数
- week_start: 周开始日期
- created_at/updated_at: 时间戳

## 开发命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 部署

1. 设置 Supabase 项目
2. 配置环境变量
3. 部署到 Vercel、Netlify 或其他平台

## 许可证

MIT License
