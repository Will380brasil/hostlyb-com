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
      alerts: {
        Row: {
          action_label: string | null
          action_url: string | null
          cleaning_job_id: string | null
          created_at: string
          guest_id: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          priority: string
          property_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          cleaning_job_id?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          priority?: string
          property_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          cleaning_job_id?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          priority?: string
          property_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          end_date: string | null
          event_type: string
          google_event_id: string | null
          id: string
          notes: string | null
          property_id: string | null
          related_id: string | null
          start_date: string
          start_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_date?: string | null
          event_type: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          related_id?: string | null
          start_date: string
          start_time?: string | null
          title: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_date?: string | null
          event_type?: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          related_id?: string | null
          start_date?: string
          start_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaners: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          pix_key: string | null
          price_per_cleaning: number | null
          rating: number | null
          total_cleanings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          pix_key?: string | null
          price_per_cleaning?: number | null
          rating?: number | null
          total_cleanings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          pix_key?: string | null
          price_per_cleaning?: number | null
          rating?: number | null
          total_cleanings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cleaning_jobs: {
        Row: {
          access_token: string
          admin_email_sent: boolean
          calendar_event_id: string | null
          checklist: Json
          cleaner_id: string | null
          completed_at: string | null
          created_at: string
          has_forgotten_items: boolean
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string
          photos: Json
          property_id: string
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string
          admin_email_sent?: boolean
          calendar_event_id?: string | null
          checklist?: Json
          cleaner_id?: string | null
          completed_at?: string | null
          created_at?: string
          has_forgotten_items?: boolean
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string
          photos?: Json
          property_id: string
          scheduled_date: string
          scheduled_time?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          admin_email_sent?: boolean
          calendar_event_id?: string | null
          checklist?: Json
          cleaner_id?: string | null
          completed_at?: string | null
          created_at?: string
          has_forgotten_items?: boolean
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string
          photos?: Json
          property_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_jobs_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      forgotten_items: {
        Row: {
          cleaning_job_id: string
          created_at: string
          description: string
          found_date: string
          id: string
          notes: string | null
          photo_url: string | null
          property_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cleaning_job_id: string
          created_at?: string
          description: string
          found_date?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          property_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cleaning_job_id?: string
          created_at?: string
          description?: string
          found_date?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          property_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forgotten_items_cleaning_job_id_fkey"
            columns: ["cleaning_job_id"]
            isOneToOne: false
            referencedRelation: "cleaning_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forgotten_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          checkin_date: string
          checkout_date: string
          created_at: string
          document: string | null
          email: string | null
          ical_uid: string | null
          id: string
          name: string
          nights: number | null
          notes: string | null
          phone: string | null
          platform: string
          property_id: string
          rating: number | null
          source: string | null
          status: string
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date: string
          checkout_date: string
          created_at?: string
          document?: string | null
          email?: string | null
          ical_uid?: string | null
          id?: string
          name: string
          nights?: number | null
          notes?: string | null
          phone?: string | null
          platform?: string
          property_id: string
          rating?: number | null
          source?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          checkout_date?: string
          created_at?: string
          document?: string | null
          email?: string | null
          ical_uid?: string | null
          id?: string
          name?: string
          nights?: number | null
          notes?: string | null
          phone?: string | null
          platform?: string
          property_id?: string
          rating?: number | null
          source?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_feeds: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          last_synced_at: string | null
          platform: string
          property_id: string
          sync_frequency: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          platform?: string
          property_id: string
          sync_frequency?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          platform?: string
          property_id?: string
          sync_frequency?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          max_members: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_members?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_members?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          archived: boolean
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          id: string
          income_monthly: number | null
          latitude: number | null
          longitude: number | null
          max_guests: number | null
          name: string
          notes: string | null
          rating: number | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
          wifi_password: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          archived?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          income_monthly?: number | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number | null
          name: string
          notes?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wifi_password?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          archived?: boolean
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          income_monthly?: number | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number | null
          name?: string
          notes?: string | null
          rating?: number | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wifi_password?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      property_cleaners: {
        Row: {
          cleaner_id: string
          created_at: string
          property_id: string
          user_id: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          property_id: string
          user_id: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_cleaners_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_cleaners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: Json }
      cleaner_add_forgotten_item: {
        Args: {
          p_description: string
          p_notes?: string
          p_photo_url?: string
          p_token: string
        }
        Returns: string
      }
      cleaner_get_job: { Args: { p_token: string }; Returns: Json }
      cleaner_update_job: {
        Args: {
          p_checklist?: Json
          p_notes?: string
          p_photos?: Json
          p_status?: string
          p_token: string
        }
        Returns: Json
      }
      create_alert: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_cleaning_id?: string
          p_guest_id?: string
          p_message: string
          p_priority?: string
          p_property_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_invite_by_token: { Args: { p_token: string }; Returns: Json }
      has_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
    }
    Enums: {
      org_role: "owner" | "admin" | "staff"
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
      org_role: ["owner", "admin", "staff"],
    },
  },
} as const
