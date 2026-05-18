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
      admin_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          action_label: string | null
          action_url: string | null
          archived_at: string | null
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
          archived_at?: string | null
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
          archived_at?: string | null
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
          {
            foreignKeyName: "calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_cleaning_stats"
            referencedColumns: ["property_id"]
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
          payment_details: string | null
          payment_method: string
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
          payment_details?: string | null
          payment_method?: string
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
          payment_details?: string | null
          payment_method?: string
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
          duration_minutes: number | null
          has_forgotten_items: boolean
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string
          photos: Json
          property_id: string
          scheduled_date: string
          scheduled_time: string
          started_at: string | null
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
          duration_minutes?: number | null
          has_forgotten_items?: boolean
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string
          photos?: Json
          property_id: string
          scheduled_date: string
          scheduled_time?: string
          started_at?: string | null
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
          duration_minutes?: number | null
          has_forgotten_items?: boolean
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string
          photos?: Json
          property_id?: string
          scheduled_date?: string
          scheduled_time?: string
          started_at?: string | null
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
          {
            foreignKeyName: "cleaning_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_cleaning_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      cleaning_photo_log: {
        Row: {
          cleaner_name: string | null
          cleaning_job_id: string
          description: string | null
          id: string
          kind: string
          photo_sent: boolean
          property_id: string | null
          room_name: string | null
          sent_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          cleaner_name?: string | null
          cleaning_job_id: string
          description?: string | null
          id?: string
          kind?: string
          photo_sent?: boolean
          property_id?: string | null
          room_name?: string | null
          sent_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          cleaner_name?: string | null
          cleaning_job_id?: string
          description?: string | null
          id?: string
          kind?: string
          photo_sent?: boolean
          property_id?: string | null
          room_name?: string | null
          sent_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cleaning_photo_thumbnails: {
        Row: {
          cleaning_job_id: string
          created_at: string
          description: string | null
          expires_at: string
          id: string
          property_id: string | null
          thumbnail_path: string
          user_id: string
        }
        Insert: {
          cleaning_job_id: string
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          property_id?: string | null
          thumbnail_path: string
          user_id: string
        }
        Update: {
          cleaning_job_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          property_id?: string | null
          thumbnail_path?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_leads: {
        Row: {
          access_count: number
          created_at: string
          email: string
          id: string
          last_access_at: string
          phone: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          access_count?: number
          created_at?: string
          email: string
          id?: string
          last_access_at?: string
          phone: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          access_count?: number
          created_at?: string
          email?: string
          id?: string
          last_access_at?: string
          phone?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      email_audience_log: {
        Row: {
          id: number
          sent_at: string
          template_name: string
          user_id: string
        }
        Insert: {
          id?: number
          sent_at?: string
          template_name: string
          user_id: string
        }
        Update: {
          id?: number
          sent_at?: string
          template_name?: string
          user_id?: string
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
          {
            foreignKeyName: "forgotten_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_cleaning_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      guests: {
        Row: {
          checkin_date: string
          checkin_submitted_at: string | null
          checkin_token: string | null
          checkout_date: string
          created_at: string
          date_of_birth: string | null
          document: string | null
          document_country: string | null
          email: string | null
          had_issue: boolean
          ical_source: string | null
          ical_uid: string | null
          id: string
          is_vip: boolean
          name: string
          nationality: string | null
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
          checkin_submitted_at?: string | null
          checkin_token?: string | null
          checkout_date: string
          created_at?: string
          date_of_birth?: string | null
          document?: string | null
          document_country?: string | null
          email?: string | null
          had_issue?: boolean
          ical_source?: string | null
          ical_uid?: string | null
          id?: string
          is_vip?: boolean
          name: string
          nationality?: string | null
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
          checkin_submitted_at?: string | null
          checkin_token?: string | null
          checkout_date?: string
          created_at?: string
          date_of_birth?: string | null
          document?: string | null
          document_country?: string | null
          email?: string | null
          had_issue?: boolean
          ical_source?: string | null
          ical_uid?: string | null
          id?: string
          is_vip?: boolean
          name?: string
          nationality?: string | null
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
          {
            foreignKeyName: "guests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_cleaning_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      ical_feeds: {
        Row: {
          created_at: string
          events_imported: number
          id: string
          is_active: boolean
          label: string | null
          last_error: string | null
          last_status: string | null
          last_sync_at: string | null
          platform: string
          property_id: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events_imported?: number
          id?: string
          is_active?: boolean
          label?: string | null
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          platform?: string
          property_id: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events_imported?: number
          id?: string
          is_active?: boolean
          label?: string | null
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          platform?: string
          property_id?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_issues: {
        Row: {
          cleaning_job_id: string | null
          cost: number | null
          created_at: string
          description: string
          guest_id: string | null
          id: string
          identified_date: string | null
          internal_notes: string | null
          photo_url: string | null
          property_id: string
          reported_by: string
          resolved_at: string | null
          responsible: string | null
          status: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          cleaning_job_id?: string | null
          cost?: number | null
          created_at?: string
          description: string
          guest_id?: string | null
          id?: string
          identified_date?: string | null
          internal_notes?: string | null
          photo_url?: string | null
          property_id: string
          reported_by?: string
          resolved_at?: string | null
          responsible?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          cleaning_job_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          guest_id?: string | null
          id?: string
          identified_date?: string | null
          internal_notes?: string | null
          photo_url?: string | null
          property_id?: string
          reported_by?: string
          resolved_at?: string | null
          responsible?: string | null
          status?: string
          updated_at?: string
          urgency?: string
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
          billing_currency: string
          billing_interval: string
          created_at: string
          current_property_count: number
          display_name: string | null
          email: string | null
          ical_export_token: string
          id: string
          locale: string
          property_tier: number
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          billing_currency?: string
          billing_interval?: string
          created_at?: string
          current_property_count?: number
          display_name?: string | null
          email?: string | null
          ical_export_token?: string
          id: string
          locale?: string
          property_tier?: number
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          billing_currency?: string
          billing_interval?: string
          created_at?: string
          current_property_count?: number
          display_name?: string | null
          email?: string | null
          ical_export_token?: string
          id?: string
          locale?: string
          property_tier?: number
          suspended_at?: string | null
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
          guidebook_data: Json
          guidebook_enabled: boolean
          guidebook_slug: string | null
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
          guidebook_data?: Json
          guidebook_enabled?: boolean
          guidebook_slug?: string | null
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
          guidebook_data?: Json
          guidebook_enabled?: boolean
          guidebook_slug?: string | null
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
          {
            foreignKeyName: "property_cleaners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_cleaning_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          organization_id: string | null
          plan_tier: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          organization_id?: string | null
          plan_tier?: string
          price_id?: string | null
          product_id?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          organization_id?: string | null
          plan_tier?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      transactions: {
        Row: {
          amount: number
          category: string
          cleaning_job_id: string | null
          created_at: string
          date: string
          description: string
          guest_id: string | null
          id: string
          notes: string | null
          origin: string
          payment_method: string | null
          property_id: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          cleaning_job_id?: string | null
          created_at?: string
          date?: string
          description: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          origin?: string
          payment_method?: string | null
          property_id?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          cleaning_job_id?: string | null
          created_at?: string
          date?: string
          description?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          origin?: string
          payment_method?: string | null
          property_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      property_cleaning_stats: {
        Row: {
          avg_duration_minutes: number | null
          cleanings_this_month: number | null
          last_cleaning_at: string | null
          open_issues: number | null
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          avg_duration_minutes?: never
          cleanings_this_month?: never
          last_cleaning_at?: never
          open_issues?: never
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          avg_duration_minutes?: never
          cleanings_this_month?: never
          last_cleaning_at?: never
          open_issues?: never
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: Json }
      can_add_member: { Args: { _org: string }; Returns: boolean }
      can_add_property: { Args: { _user: string }; Returns: boolean }
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
      cleaner_report_problem: {
        Args: {
          p_description: string
          p_photo_url?: string
          p_token: string
          p_urgency?: string
        }
        Returns: string
      }
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_ical_export: {
        Args: { p_token: string }
        Returns: {
          checkin_date: string
          checkout_date: string
          guest_id: string
          guest_name: string
          platform: string
          property_name: string
          user_display_name: string
        }[]
      }
      get_invite_by_token: { Args: { p_token: string }; Returns: Json }
      get_public_guidebook: { Args: { p_slug: string }; Returns: Json }
      guest_checkin_get: { Args: { p_token: string }; Returns: Json }
      guest_checkin_submit: {
        Args: {
          p_date_of_birth: string
          p_document: string
          p_document_country: string
          p_name: string
          p_nationality: string
          p_token: string
        }
        Returns: Json
      }
      has_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      org_has_active_subscription: {
        Args: { _env?: string; _org_id: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      user_can_access_app: { Args: { _user: string }; Returns: boolean }
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
