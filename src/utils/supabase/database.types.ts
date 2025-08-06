export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      plan_items: {
        Row: {
          id: string
          plan_id: string
          title: string
          description: string | null
          date: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          title: string
          description?: string | null
          date: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          title?: string
          description?: string | null
          date?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          task_name: string
          task_category: string
          hours: number
          date: string
          reflection: string | null
          weekly_goal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_name: string
          task_category: string
          hours: number
          date: string
          reflection?: string | null
          weekly_goal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_name?: string
          task_category?: string
          hours?: number
          date?: string
          reflection?: string | null
          weekly_goal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_weekly_goal_id_fkey"
            columns: ["weekly_goal_id"]
            isOneToOne: false
            referencedRelation: "weekly_goals"
            referencedColumns: ["id"]
          }
        ]
      }
      weekly_goals: {
        Row: {
          id: string
          user_id: string
          task_category: string
          target_hours: number
          week_start: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_category: string
          target_hours: number
          week_start: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_category?: string
          target_hours?: number
          week_start?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}