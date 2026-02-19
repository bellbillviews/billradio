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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_analytics: {
        Row: {
          ad_id: string
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_hash: string | null
          os: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          ad_id: string
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          ip_hash?: string | null
          os?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_id?: string
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          os?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "billboard_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_networks: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          network_type: string
          placement: string | null
          priority: number | null
          publisher_id: string | null
          slot_ids: Json | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          network_type: string
          placement?: string | null
          priority?: number | null
          publisher_id?: string | null
          slot_ids?: Json | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          network_type?: string
          placement?: string | null
          priority?: number | null
          publisher_id?: string | null
          slot_ids?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      billboard_ads: {
        Row: {
          ad_type: string
          advertiser_email: string | null
          advertiser_name: string
          advertiser_phone: string | null
          created_at: string
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_auto_end: boolean | null
          link_url: string | null
          notes: string | null
          placement: string
          price: number | null
          priority: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          ad_type?: string
          advertiser_email?: string | null
          advertiser_name: string
          advertiser_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_auto_end?: boolean | null
          link_url?: string | null
          notes?: string | null
          placement?: string
          price?: number | null
          priority?: number | null
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          advertiser_email?: string | null
          advertiser_name?: string
          advertiser_phone?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_auto_end?: boolean | null
          link_url?: string | null
          notes?: string | null
          placement?: string
          price?: number | null
          priority?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_platforms: {
        Row: {
          created_at: string
          embed_code: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          platform_type: string
          stream_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          embed_code?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          platform_type: string
          stream_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          embed_code?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          platform_type?: string
          stream_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_queue: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_type: string
          file_url: string | null
          id: string
          is_active: boolean | null
          queue_type: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          queue_type?: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          queue_type?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      listener_requests: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          location: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          location: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          location?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      listener_sessions: {
        Row: {
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          last_heartbeat: string
          listening_mode: string | null
          session_id: string
          started_at: string
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_heartbeat?: string
          listening_mode?: string | null
          session_id: string
          started_at?: string
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_heartbeat?: string
          listening_mode?: string | null
          session_id?: string
          started_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      presenters: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_media: {
        Row: {
          created_at: string
          file_type: string
          file_url: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          repeat_mode: string | null
          scheduled_end: string | null
          scheduled_start: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          repeat_mode?: string | null
          scheduled_end?: string | null
          scheduled_start: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          repeat_mode?: string | null
          scheduled_end?: string | null
          scheduled_start?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shows: {
        Row: {
          created_at: string
          description: string | null
          host: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          schedule: string | null
          sort_order: number | null
          time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          host: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          schedule?: string | null
          sort_order?: number | null
          time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          host?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          schedule?: string | null
          sort_order?: number | null
          time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      stream_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          rtmp_url: string | null
          stream_key: string | null
          stream_type: string
          stream_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          rtmp_url?: string | null
          stream_key?: string | null
          stream_type: string
          stream_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rtmp_url?: string | null
          stream_key?: string | null
          stream_type?: string
          stream_url?: string | null
          updated_at?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
