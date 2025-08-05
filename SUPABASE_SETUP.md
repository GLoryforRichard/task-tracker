# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建一个新项目
3. 记录以下信息：
   - 项目 URL
   - 匿名密钥 (anon key)

## 2. 数据库结构设置

### 创建任务表

```sql
-- 创建任务表
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_category TEXT NOT NULL,
  hours DECIMAL(4,2) NOT NULL CHECK (hours > 0),
  date DATE NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_category ON tasks(task_category);

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 创建每周目标表

```sql
-- 创建每周目标表
CREATE TABLE weekly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_category TEXT NOT NULL,
  target_hours DECIMAL(4,2) NOT NULL CHECK (target_hours > 0),
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_category, week_start)
);

-- 创建索引
CREATE INDEX idx_weekly_goals_user_id ON weekly_goals(user_id);
CREATE INDEX idx_weekly_goals_week ON weekly_goals(week_start);

-- 创建更新触发器
CREATE TRIGGER update_weekly_goals_updated_at BEFORE UPDATE ON weekly_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. 设置 RLS (行级安全)

### 任务表 RLS
```sql
-- 启用 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户只能查看自己的任务" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的任务" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的任务" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的任务" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### 每周目标表 RLS
```sql
-- 启用 RLS
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户只能查看自己的目标" ON weekly_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的目标" ON weekly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的目标" ON weekly_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的目标" ON weekly_goals
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. 环境变量配置

创建 `.env.local` 文件：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 6. 功能测试

1. 访问 http://localhost:3000 查看首页
2. 注册新用户
3. 登录后开始使用各项功能