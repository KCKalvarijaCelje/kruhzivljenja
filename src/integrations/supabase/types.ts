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
      date_recipients: {
        Row: {
          created_at: string
          force_include: boolean
          household_id: string | null
          id: string
          manual_name: string | null
          notes: string | null
          person_id: string | null
          schedule_date_id: string
        }
        Insert: {
          created_at?: string
          force_include?: boolean
          household_id?: string | null
          id?: string
          manual_name?: string | null
          notes?: string | null
          person_id?: string | null
          schedule_date_id: string
        }
        Update: {
          created_at?: string
          force_include?: boolean
          household_id?: string | null
          id?: string
          manual_name?: string | null
          notes?: string | null
          person_id?: string | null
          schedule_date_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_recipients_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "recipient_households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_recipients_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_recipients_schedule_date_id_fkey"
            columns: ["schedule_date_id"]
            isOneToOne: false
            referencedRelation: "schedule_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_notification_log: {
        Row: {
          created_at: string
          driver_person_id: string
          error_message: string | null
          id: string
          message_id: string | null
          notification_type: string
          recipient_email: string
          schedule_stop_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          driver_person_id: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          notification_type: string
          recipient_email: string
          schedule_stop_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          driver_person_id?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          notification_type?: string
          recipient_email?: string
          schedule_stop_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_notification_log_driver_person_id_fkey"
            columns: ["driver_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_notification_log_schedule_stop_id_fkey"
            columns: ["schedule_stop_id"]
            isOneToOne: false
            referencedRelation: "schedule_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_pickup_households: {
        Row: {
          created_at: string
          household_id: string
          id: string
          person_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          person_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          person_id?: string
        }
        Relationships: []
      }
      email_brand_settings: {
        Row: {
          app_name: string
          footer_text: string | null
          header_image_url: string | null
          id: number
          logo_url: string | null
          primary_color: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app_name?: string
          footer_text?: string | null
          header_image_url?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app_name?: string
          footer_text?: string | null
          header_image_url?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          provider_message_id: string | null
          provider_response: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider_message_id?: string | null
          provider_response?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider_message_id?: string | null
          provider_response?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          description: string | null
          footer: string | null
          id: string
          language: string
          placeholders: string[]
          subject: string
          template_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          description?: string | null
          footer?: string | null
          id?: string
          language?: string
          placeholders?: string[]
          subject: string
          template_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          description?: string | null
          footer?: string | null
          id?: string
          language?: string
          placeholders?: string[]
          subject?: string
          template_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      household_members: {
        Row: {
          full_name: string
          household_id: string
          id: string
          notes: string | null
          person_id: string | null
        }
        Insert: {
          full_name: string
          household_id: string
          id?: string
          notes?: string | null
          person_id?: string | null
        }
        Update: {
          full_name?: string
          household_id?: string
          id?: string
          notes?: string | null
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "recipient_households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ministry_years: {
        Row: {
          created_at: string
          id: string
          label: string
          start_year: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          start_year: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          start_year?: number
        }
        Relationships: []
      }
      people: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          needs_name_review: boolean
          notes: string | null
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          last_name?: string | null
          needs_name_review?: boolean
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          needs_name_review?: boolean
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      people_roles: {
        Row: {
          id: string
          person_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          person_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          person_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "people_roles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_profile_link_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          person_id: string | null
          profile_id: string | null
          role: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          person_id?: string | null
          profile_id?: string | null
          role?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          person_id?: string | null
          profile_id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipient_households: {
        Row: {
          active: boolean
          address: string | null
          contact_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          needs_name_review: boolean
          notes: string | null
          person_id: string | null
          phone: string | null
          size: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          needs_name_review?: boolean
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          size?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          needs_name_review?: boolean
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          size?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipient_households_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_recipient_templates: {
        Row: {
          created_at: string
          household_id: string
          id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          rule_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_recipient_templates_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "recipient_households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_recipient_templates_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedule_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedule_rule_stops: {
        Row: {
          created_at: string
          default_coordinator_id: string | null
          default_driver_id: string | null
          id: string
          location_id: string
          rule_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          default_coordinator_id?: string | null
          default_driver_id?: string | null
          id?: string
          location_id: string
          rule_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          default_coordinator_id?: string | null
          default_driver_id?: string | null
          id?: string
          location_id?: string
          rule_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedule_rule_stops_default_coordinator_id_fkey"
            columns: ["default_coordinator_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedule_rule_stops_default_driver_id_fkey"
            columns: ["default_driver_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedule_rule_stops_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedule_rule_stops_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedule_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedule_rules: {
        Row: {
          active: boolean
          created_at: string
          frequency: string
          id: string
          weekday: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          weekday: number
        }
        Update: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          weekday?: number
        }
        Relationships: []
      }
      schedule_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          ministry_year_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          ministry_year_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          ministry_year_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_dates_ministry_year_id_fkey"
            columns: ["ministry_year_id"]
            isOneToOne: false
            referencedRelation: "ministry_years"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_stops: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          coordinator_id: string | null
          created_at: string
          driver_id: string | null
          id: string
          location_id: string | null
          notes: string | null
          rule_stop_id: string | null
          schedule_date_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          coordinator_id?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          rule_stop_id?: string | null
          schedule_date_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          coordinator_id?: string | null
          created_at?: string
          driver_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          rule_stop_id?: string | null
          schedule_date_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_stops_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stops_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stops_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stops_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stops_rule_stop_id_fkey"
            columns: ["rule_stop_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedule_rule_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stops_schedule_date_id_fkey"
            columns: ["schedule_date_id"]
            isOneToOne: false
            referencedRelation: "schedule_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      stop_messages: {
        Row: {
          author_id: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          schedule_stop_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          schedule_stop_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          schedule_stop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stop_messages_schedule_stop_id_fkey"
            columns: ["schedule_stop_id"]
            isOneToOne: false
            referencedRelation: "schedule_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      admin_get_cron_status: { Args: never; Returns: Json }
      apply_assignments_to_future: {
        Args: { _from_date: string; _override?: boolean; _rule_stop_id: string }
        Returns: number
      }
      apply_person_to_future: {
        Args: {
          _field: string
          _from_date: string
          _person_id: string
          _rule_stop_id: string
          _update_template?: boolean
        }
        Returns: number
      }
      apply_template_to_future: {
        Args: { _from_date: string; _rule_id: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_ministry_year: { Args: { _start_year: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
      link_or_create_person_for_profile: {
        Args: {
          _force_create?: boolean
          _link_to_person_id?: string
          _profile_id: string
        }
        Returns: Json
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      my_person_id: { Args: never; Returns: string }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      sync_person_role: {
        Args: {
          _enabled: boolean
          _profile_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "driver" | "coordinator" | "recipient" | "volunteer"
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
      app_role: ["admin", "driver", "coordinator", "recipient", "volunteer"],
    },
  },
} as const
