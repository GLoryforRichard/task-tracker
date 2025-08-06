-- 为任务表添加目标关联字段的SQL脚本
-- 需要在Supabase SQL编辑器中执行这些命令

-- 1. 为任务表添加weekly_goal_id外键字段
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE SET NULL;

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_weekly_goal_id ON tasks(weekly_goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_category_date ON tasks(user_id, task_category, date);

-- 3. 更新数据库类型定义（需要同步到database.types.ts）
-- 这个脚本主要用于数据库结构更新，类型定义需要手动同步到代码中

-- 4. 为已有任务设置weekly_goal_id（基于task_category匹配）
-- 这个更新会在应用层面处理，不在这里直接执行

-- 5. 可选：添加触发器来自动更新weekly_goals中的进度
-- 由于我们已经在应用层面处理进度计算，这里不需要数据库触发器