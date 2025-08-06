-- 新增功能的数据库表结构
-- 需要在Supabase SQL编辑器中执行这些命令

-- 1. 创建笔记表 (notes)
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为笔记表创建RLS策略
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的笔记
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- 2. 创建日记条目表 (journal_entries)
CREATE TABLE journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date) -- 每个用户每天只能有一条日记
);

-- 为日记表创建RLS策略
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的日记
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 3. 创建计划表 (plans)
CREATE TABLE plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为计划表创建RLS策略
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的计划
CREATE POLICY "Users can view their own plans" ON plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" ON plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON plans
    FOR DELETE USING (auth.uid() = user_id);

-- 4. 创建计划项目表 (plan_items)
CREATE TABLE plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为计划项目表创建RLS策略
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己计划的项目
CREATE POLICY "Users can view their own plan items" ON plan_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM plans 
            WHERE plans.id = plan_items.plan_id 
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own plan items" ON plan_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM plans 
            WHERE plans.id = plan_items.plan_id 
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own plan items" ON plan_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM plans 
            WHERE plans.id = plan_items.plan_id 
            AND plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own plan items" ON plan_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM plans 
            WHERE plans.id = plan_items.plan_id 
            AND plans.user_id = auth.uid()
        )
    );

-- 创建索引以提高查询性能
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_created_at ON plans(created_at DESC);
CREATE INDEX idx_plan_items_plan_id ON plan_items(plan_id);
CREATE INDEX idx_plan_items_date ON plan_items(date);