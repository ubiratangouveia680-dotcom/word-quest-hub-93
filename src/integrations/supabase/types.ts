export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_settings: {
        Row: {
          ads_enabled: boolean
          ads_txt: string
          ga_measurement_id: string
          id: number
          publisher_id: string
          slot_banner: string
          slot_desktop: string
          slot_end_of_chapter: string
          slot_in_article: string
          slot_mobile: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ads_enabled?: boolean
          ads_txt?: string
          ga_measurement_id?: string
          id?: number
          publisher_id?: string
          slot_banner?: string
          slot_desktop?: string
          slot_end_of_chapter?: string
          slot_in_article?: string
          slot_mobile?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ads_enabled?: boolean
          ads_txt?: string
          ga_measurement_id?: string
          id?: number
          publisher_id?: string
          slot_banner?: string
          slot_desktop?: string
          slot_end_of_chapter?: string
          slot_in_article?: string
          slot_mobile?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_notification_settings: {
        Row: {
          custom_afternoon_title: string
          custom_evening_title: string
          custom_morning_title: string
          default_afternoon_time: string
          default_evening_time: string
          default_morning_time: string
          global_enabled: boolean
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          custom_afternoon_title?: string
          custom_evening_title?: string
          custom_morning_title?: string
          default_afternoon_time?: string
          default_evening_time?: string
          default_morning_time?: string
          global_enabled?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          custom_afternoon_title?: string
          custom_evening_title?: string
          custom_morning_title?: string
          default_afternoon_time?: string
          default_evening_time?: string
          default_morning_time?: string
          global_enabled?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      answer_likes: {
        Row: {
          answer_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_likes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          body: string
          created_at: string
          id: string
          is_accepted: boolean
          likes_count: number
          parent_id: string | null
          question_id: string
          updated_at: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          likes_count?: number
          parent_id?: string | null
          question_id: string
          updated_at?: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          likes_count?: number
          parent_id?: string | null
          question_id?: string
          updated_at?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_materials: {
        Row: {
          audience: string
          author: string
          bible_book: string | null
          category: string
          category_slug: string
          conclusion: string | null
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string
          id: string
          is_downloadable: boolean
          lesson_number: number | null
          level: string
          main_verse: string | null
          main_verse_ref: string | null
          objectives: string[] | null
          practical_application: string | null
          questions: string[] | null
          reference_verses: Json | null
          series: string | null
          slug: string
          status: string
          table_of_contents: Json | null
          title: string
          topics: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          audience?: string
          author?: string
          bible_book?: string | null
          category: string
          category_slug: string
          conclusion?: string | null
          content: string
          cover_url?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_downloadable?: boolean
          lesson_number?: number | null
          level?: string
          main_verse?: string | null
          main_verse_ref?: string | null
          objectives?: string[] | null
          practical_application?: string | null
          questions?: string[] | null
          reference_verses?: Json | null
          series?: string | null
          slug: string
          status?: string
          table_of_contents?: Json | null
          title: string
          topics?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          audience?: string
          author?: string
          bible_book?: string | null
          category?: string
          category_slug?: string
          conclusion?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_downloadable?: boolean
          lesson_number?: number | null
          level?: string
          main_verse?: string | null
          main_verse_ref?: string | null
          objectives?: string[] | null
          practical_application?: string | null
          questions?: string[] | null
          reference_verses?: Json | null
          series?: string | null
          slug?: string
          status?: string
          table_of_contents?: Json | null
          title?: string
          topics?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bible_quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          passed: boolean
          question_ids: string[]
          score: number
          total_questions: number
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          passed: boolean
          question_ids: string[]
          score: number
          total_questions?: number
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          passed?: boolean
          question_ids?: string[]
          score?: number
          total_questions?: number
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      bible_quiz_rankings: {
        Row: {
          avatar_url: string | null
          best_score: number
          display_name: string
          id: string
          last_attempt_at: string
          passed_attempts: number
          total_attempts: number
          total_score: number
          user_id: string | null
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          best_score?: number
          display_name: string
          id?: string
          last_attempt_at?: string
          passed_attempts?: number
          total_attempts?: number
          total_score?: number
          user_id?: string | null
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          best_score?: number
          display_name?: string
          id?: string
          last_attempt_at?: string
          passed_attempts?: number
          total_attempts?: number
          total_score?: number
          user_id?: string | null
          win_rate?: number
        }
        Relationships: []
      }
      community_blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id: string
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          reference: string
          text: string | null
          user_id: string
          verse: number | null
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          reference: string
          text?: string | null
          user_id: string
          verse?: number | null
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          reference?: string
          text?: string | null
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          answer_id: string | null
          created_at: string
          id: string
          message: string
          question_id: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          answer_id?: string | null
          created_at?: string
          id?: string
          message: string
          question_id: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          answer_id?: string | null
          created_at?: string
          id?: string
          message?: string
          question_id?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_notification_preferences: {
        Row: {
          community_enabled: boolean
          prayer_requests_enabled: boolean
          prayer_support_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          community_enabled?: boolean
          prayer_requests_enabled?: boolean
          prayer_support_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          community_enabled?: boolean
          prayer_requests_enabled?: boolean
          prayer_support_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_reports: {
        Row: {
          created_at: string
          id: string
          prayer_request_id: string
          reason: string
          reporter_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_request_id: string
          reason: string
          reporter_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_request_id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reports_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          prayed_count: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          prayed_count?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          prayed_count?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      prayer_support: {
        Row: {
          created_at: string
          id: string
          prayer_request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_support_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          last_seen_at: string | null
          name: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_seen_at?: string | null
          name?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_seen_at?: string | null
          name?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_name: string | null
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          device_name?: string | null
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          device_name?: string | null
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      question_likes: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_likes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          accepted_answer_id: string | null
          answers_count: number
          body: string
          category_id: string
          created_at: string
          id: string
          is_answered: boolean
          likes_count: number
          title: string
          updated_at: string
          user_id: string
          verse_reference: string | null
          views_count: number
        }
        Insert: {
          accepted_answer_id?: string | null
          answers_count?: number
          body: string
          category_id: string
          created_at?: string
          id?: string
          is_answered?: boolean
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
          verse_reference?: string | null
          views_count?: number
        }
        Update: {
          accepted_answer_id?: string | null
          answers_count?: number
          body?: string
          category_id?: string
          created_at?: string
          id?: string
          is_answered?: boolean
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
          verse_reference?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_questions_accepted_answer"
            columns: ["accepted_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          reaction_name: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          reaction_name: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          reaction_name?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          reference: string
          updated_at: string
          user_id: string
          verse: number | null
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          reference: string
          updated_at?: string
          user_id: string
          verse?: number | null
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          reference?: string
          updated_at?: string
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          afternoon_enabled: boolean
          afternoon_time: string
          created_at: string
          evening_enabled: boolean
          evening_time: string
          id: string
          morning_enabled: boolean
          morning_time: string
          push_subscription: Json | null
          timezone: string
          updated_at: string
          user_id: string | null
          verse_notifications_enabled: boolean
        }
        Insert: {
          afternoon_enabled?: boolean
          afternoon_time?: string
          created_at?: string
          evening_enabled?: boolean
          evening_time?: string
          id?: string
          morning_enabled?: boolean
          morning_time?: string
          push_subscription?: Json | null
          timezone?: string
          updated_at?: string
          user_id?: string | null
          verse_notifications_enabled?: boolean
        }
        Update: {
          afternoon_enabled?: boolean
          afternoon_time?: string
          created_at?: string
          evening_enabled?: boolean
          evening_time?: string
          id?: string
          morning_enabled?: boolean
          morning_time?: string
          push_subscription?: Json | null
          timezone?: string
          updated_at?: string
          user_id?: string | null
          verse_notifications_enabled?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verse_notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          idempotency_key: string
          notification_type: string
          scheduled_at: string | null
          sent_at: string
          status: string
          user_id: string | null
          verse_date: string
          verse_reference: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key: string
          notification_type: string
          scheduled_at?: string | null
          sent_at?: string
          status?: string
          user_id?: string | null
          verse_date: string
          verse_reference: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string
          notification_type?: string
          scheduled_at?: string | null
          sent_at?: string
          status?: string
          user_id?: string | null
          verse_date?: string
          verse_reference?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
