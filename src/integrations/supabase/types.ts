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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "parking_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_date: string
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_date: string
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_date?: string
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          bucket_id: string
          created_at: string | null
          filename: string
          id: string
          mime_type: string
          status: string | null
          storage_path: string
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          bucket_id?: string
          created_at?: string | null
          filename: string
          id?: string
          mime_type: string
          status?: string | null
          storage_path: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string
          status?: string | null
          storage_path?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      driver_owner_messages: {
        Row: {
          admin_flagged: boolean
          booking_id: string
          contains_violation: boolean
          created_at: string
          driver_id: string
          from_driver: boolean
          id: string
          is_expired: boolean
          listing_id: string | null
          message: string
          owner_id: string
          read_status: boolean
          updated_at: string
        }
        Insert: {
          admin_flagged?: boolean
          booking_id: string
          contains_violation?: boolean
          created_at?: string
          driver_id: string
          from_driver?: boolean
          id?: string
          is_expired?: boolean
          listing_id?: string | null
          message: string
          owner_id: string
          read_status?: boolean
          updated_at?: string
        }
        Update: {
          admin_flagged?: boolean
          booking_id?: string
          contains_violation?: boolean
          created_at?: string
          driver_id?: string
          from_driver?: boolean
          id?: string
          is_expired?: boolean
          listing_id?: string | null
          message?: string
          owner_id?: string
          read_status?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_owner_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "parking_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_owner_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "parking_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_document_refs: {
        Row: {
          access_count: number
          created_at: string
          document_access_token: string | null
          document_hash: string
          encrypted_storage_path: string
          encryption_key_id: string
          expires_at: string
          id: string
          last_accessed_at: string | null
          token_expires_at: string | null
          updated_at: string
          verification_id: string
        }
        Insert: {
          access_count?: number
          created_at?: string
          document_access_token?: string | null
          document_hash: string
          encrypted_storage_path: string
          encryption_key_id: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          verification_id: string
        }
        Update: {
          access_count?: number
          created_at?: string
          document_access_token?: string | null
          document_hash?: string
          encrypted_storage_path?: string
          encryption_key_id?: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_document_refs_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: true
            referencedRelation: "user_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          publication_date: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publication_date?: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publication_date?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          news_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_type: string
          image_url: string
          news_id: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_type?: string
          image_url: string
          news_id?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_type?: string
          image_url?: string
          news_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_images_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_bookings: {
        Row: {
          confirmation_deadline: string | null
          cost_aed: number
          created_at: string
          duration_hours: number
          end_time: string
          id: string
          location: string
          payment_amount_cents: number | null
          payment_link_url: string | null
          payment_status: string | null
          payment_type: string | null
          start_time: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          zone: string
        }
        Insert: {
          confirmation_deadline?: string | null
          cost_aed: number
          created_at?: string
          duration_hours: number
          end_time: string
          id?: string
          location: string
          payment_amount_cents?: number | null
          payment_link_url?: string | null
          payment_status?: string | null
          payment_type?: string | null
          start_time: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          zone: string
        }
        Update: {
          confirmation_deadline?: string | null
          cost_aed?: number
          created_at?: string
          duration_hours?: number
          end_time?: string
          id?: string
          location?: string
          payment_amount_cents?: number | null
          payment_link_url?: string | null
          payment_status?: string | null
          payment_type?: string | null
          start_time?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          zone?: string
        }
        Relationships: []
      }
      parking_listings: {
        Row: {
          address: string
          availability_schedule: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          owner_id: string | null
          price_per_day: number | null
          price_per_hour: number
          price_per_month: number | null
          status: string | null
          title: string
          updated_at: string | null
          zone: string
        }
        Insert: {
          address: string
          availability_schedule?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          owner_id?: string | null
          price_per_day?: number | null
          price_per_hour: number
          price_per_month?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          zone: string
        }
        Update: {
          address?: string
          availability_schedule?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          owner_id?: string | null
          price_per_day?: number | null
          price_per_hour?: number
          price_per_month?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          zone?: string
        }
        Relationships: []
      }
      parking_listings_public: {
        Row: {
          address: string | null
          availability_schedule: Json | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          price_per_day: number | null
          price_per_hour: number | null
          price_per_month: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          availability_schedule?: Json | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id: string
          images?: string[] | null
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          availability_schedule?: Json | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          price_per_day?: number | null
          price_per_hour?: number | null
          price_per_month?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      parking_space_audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          is_override: boolean
          new_status: string
          old_status: string | null
          override_reason: string | null
          space_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          is_override?: boolean
          new_status: string
          old_status?: string | null
          override_reason?: string | null
          space_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          is_override?: boolean
          new_status?: string
          old_status?: string | null
          override_reason?: string | null
          space_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parking_space_audit_log_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "parking_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      parking_spaces: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          override_by: string | null
          override_reason: string | null
          override_status: boolean
          space_number: string
          space_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          override_by?: string | null
          override_reason?: string | null
          override_status?: boolean
          space_number: string
          space_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          override_by?: string | null
          override_reason?: string | null
          override_status?: boolean
          space_number?: string
          space_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parking_spaces_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "parking_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_access_audit: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          booking_id: string
          id: string
          ip_address: unknown | null
          payment_fields_accessed: string[] | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          booking_id: string
          id?: string
          ip_address?: unknown | null
          payment_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          booking_id?: string
          id?: string
          ip_address?: unknown | null
          payment_fields_accessed?: string[] | null
          user_agent?: string | null
        }
        Relationships: []
      }
      photo_repair_reports: {
        Row: {
          car_park_id: string | null
          created_at: string
          error_type: string
          failing_url: string
          id: string
          page_path: string | null
          space_id: string | null
          user_agent: string | null
        }
        Insert: {
          car_park_id?: string | null
          created_at?: string
          error_type?: string
          failing_url: string
          id?: string
          page_path?: string | null
          space_id?: string | null
          user_agent?: string | null
        }
        Update: {
          car_park_id?: string | null
          created_at?: string
          error_type?: string
          failing_url?: string
          id?: string
          page_path?: string | null
          space_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profile_access_audit: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string
          accessed_by: string
          fields_accessed: string[] | null
          id: string
          ip_address: unknown | null
          profile_user_id: string
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string
          accessed_by: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown | null
          profile_user_id: string
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: unknown | null
          profile_user_id?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_confirmed_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          signup_notified: boolean | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_confirmed_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          signup_notified?: boolean | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_confirmed_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          signup_notified?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      secure_document_access_log: {
        Row: {
          access_granted: boolean
          access_method: string
          accessed_at: string
          accessed_by: string
          denial_reason: string | null
          expires_token_used: boolean | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          verification_id: string
        }
        Insert: {
          access_granted: boolean
          access_method: string
          accessed_at?: string
          accessed_by: string
          denial_reason?: string | null
          expires_token_used?: boolean | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          verification_id: string
        }
        Update: {
          access_granted?: boolean
          access_method?: string
          accessed_at?: string
          accessed_by?: string
          denial_reason?: string | null
          expires_token_used?: boolean | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_document_access_log_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "user_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string
          from_admin: boolean
          id: string
          message: string
          read_status: boolean
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_admin?: boolean
          id?: string
          message: string
          read_status?: boolean
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_admin?: boolean
          id?: string
          message?: string
          read_status?: boolean
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "parking_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_verifications: {
        Row: {
          access_restricted: boolean | null
          auto_expire_days: number
          created_at: string
          document_access_token: string | null
          document_encrypted: boolean | null
          document_image_url: string
          document_type: string
          full_name: string
          id: string
          last_admin_access: string | null
          nationality: string | null
          security_level: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          access_restricted?: boolean | null
          auto_expire_days?: number
          created_at?: string
          document_access_token?: string | null
          document_encrypted?: boolean | null
          document_image_url: string
          document_type: string
          full_name: string
          id?: string
          last_admin_access?: string | null
          nationality?: string | null
          security_level?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          access_restricted?: boolean | null
          auto_expire_days?: number
          created_at?: string
          document_access_token?: string | null
          document_encrypted?: boolean | null
          document_image_url?: string
          document_type?: string
          full_name?: string
          id?: string
          last_admin_access?: string | null
          nationality?: string | null
          security_level?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      verification_audit_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          created_at: string
          document_id: string
          id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          created_at?: string
          document_id: string
          id?: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          created_at?: string
          document_id?: string
          id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_parking_listing: {
        Args: { listing_id: string }
        Returns: Json
      }
      admin_delete_parking_listing_complete: {
        Args: { listing_id: string }
        Returns: Json
      }
      admin_delete_user_verification: {
        Args: { verification_id: string }
        Returns: Json
      }
      admin_emergency_profile_access: {
        Args: { emergency_reason: string; target_user_id: string }
        Returns: {
          created_at: string
          email_confirmed_at: string
          full_name: string
          phone: string
          signup_notified: boolean
          updated_at: string
          user_id: string
          user_type: string
        }[]
      }
      admin_get_profile_secure: {
        Args: {
          access_reason?: string
          include_sensitive_fields?: boolean
          target_user_id: string
        }
        Returns: {
          created_at: string
          email_confirmed_at: string
          full_name: string
          phone: string
          signup_notified: boolean
          updated_at: string
          user_id: string
          user_type: string
        }[]
      }
      admin_get_verification_document: {
        Args: { verification_id: string }
        Returns: {
          document_type: string
          document_url: string
          user_full_name: string
          verification_status: string
        }[]
      }
      admin_list_profiles_secure: {
        Args: {
          access_reason?: string
          include_sensitive_fields?: boolean
          page_limit?: number
          page_offset?: number
          search_term?: string
        }
        Returns: {
          created_at: string
          email_confirmed_at: string
          full_name: string
          phone: string
          total_count: number
          user_id: string
          user_type: string
        }[]
      }
      audit_public_table_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          issue_type: string
          severity: string
        }[]
      }
      auto_expire_old_documents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      can_access_verification_document: {
        Args: { requesting_user_id?: string; verification_id: string }
        Returns: boolean
      }
      check_booking_conflicts: {
        Args: {
          p_end_time: string
          p_exclude_booking_id?: string
          p_location: string
          p_start_time: string
          p_zone: string
        }
        Returns: boolean
      }
      create_parking_spaces_for_listing: {
        Args: {
          p_listing_id: string
          space_count?: number
          space_prefix?: string
        }
        Returns: Json
      }
      create_user_profile: {
        Args: { p_full_name?: string; p_user_id: string; p_user_type?: string }
        Returns: undefined
      }
      delete_parking_space: {
        Args: { space_id: string }
        Returns: Json
      }
      encrypt_document_reference: {
        Args: { verification_id: string }
        Returns: boolean
      }
      ensure_profile_email: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_booking_chats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_unconfirmed_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_secure_document_token: {
        Args: {
          access_duration_minutes?: number
          access_method?: string
          verification_id: string
        }
        Returns: Json
      }
      generate_secure_document_url: {
        Args: { access_duration_minutes?: number; verification_id: string }
        Returns: Json
      }
      get_admin_booking_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_booking_contact_info: {
        Args: { listing_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
          owner_id: string
        }[]
      }
      get_booking_payment_details: {
        Args: { booking_id: string }
        Returns: {
          payment_amount_cents: number
          payment_link_url: string
          stripe_customer_id: string
          stripe_payment_intent_id: string
          stripe_subscription_id: string
        }[]
      }
      get_email_confirmation_expiry: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_my_booking_status: {
        Args: { booking_id: string }
        Returns: {
          cost_aed: number
          end_time: string
          id: string
          location: string
          payment_status: string
          start_time: string
          status: string
          zone: string
        }[]
      }
      get_my_bookings: {
        Args: Record<PropertyKey, never>
        Returns: {
          confirmation_deadline: string
          cost_aed: number
          created_at: string
          duration_hours: number
          end_time: string
          id: string
          location: string
          payment_status: string
          payment_type: string
          start_time: string
          status: string
          updated_at: string
          zone: string
        }[]
      }
      get_my_verification_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_type: string
          id: string
          security_level: string
          updated_at: string
          verification_status: string
        }[]
      }
      get_parking_listings_with_availability: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          availability_schedule: Json
          available_spaces: number
          booked_spaces: number
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          is_available: boolean
          maintenance_spaces: number
          price_per_day: number
          price_per_hour: number
          price_per_month: number
          status: string
          title: string
          total_spaces: number
          updated_at: string
          zone: string
        }[]
      }
      get_parking_spaces_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_updated: string
          listing_address: string
          listing_id: string
          listing_title: string
          listing_zone: string
          override_by: string
          override_reason: string
          override_status: boolean
          space_id: string
          space_number: string
          space_status: string
        }[]
      }
      get_profile_access_stats: {
        Args: { days_back?: number }
        Returns: {
          access_count: number
          access_date: string
          access_type: string
          unique_admins: number
          unique_profiles_accessed: number
        }[]
      }
      get_public_parking_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          availability_schedule: Json
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          owner_id: string
          price_per_day: number
          price_per_hour: number
          price_per_month: number
          status: string
          title: string
          updated_at: string
          zone: string
        }[]
      }
      get_safe_public_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          availability_schedule: Json
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          price_per_day: number
          price_per_hour: number
          price_per_month: number
          status: string
          title: string
          updated_at: string
          zone: string
        }[]
      }
      get_secure_document_access: {
        Args: { access_token: string; verification_id: string }
        Returns: Json
      }
      get_secure_document_reference: {
        Args: { verification_id: string }
        Returns: {
          access_expires_at: string
          encrypted_ref_id: string
          security_level: string
        }[]
      }
      get_secure_document_url: {
        Args: { expires_in?: number; verification_id: string }
        Returns: {
          expires_at: string
          signed_url: string
        }[]
      }
      get_user_bookings_safe: {
        Args: { user_uuid?: string }
        Returns: {
          confirmation_deadline: string
          cost_aed: number
          created_at: string
          duration_hours: number
          end_time: string
          id: string
          location: string
          payment_status: string
          payment_type: string
          start_time: string
          status: string
          updated_at: string
          user_id: string
          zone: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_verified_documents: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_payment_data_access: {
        Args: {
          access_type: string
          booking_id: string
          payment_fields?: string[]
        }
        Returns: undefined
      }
      log_profile_access: {
        Args: {
          access_reason?: string
          access_type: string
          fields_accessed?: string[]
          target_user_id: string
        }
        Returns: undefined
      }
      log_verification_document_access: {
        Args: { access_type: string; document_id: string; user_id?: string }
        Returns: undefined
      }
      refresh_parking_listings_public: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revoke_document_access: {
        Args: { verification_id: string }
        Returns: Json
      }
      revoke_document_access_tokens: {
        Args: { verification_id: string }
        Returns: boolean
      }
      secure_get_verification_document: {
        Args: { access_reason?: string; verification_id: string }
        Returns: {
          access_logged: boolean
          document_type: string
          document_url: string
          user_full_name: string
          verification_status: string
        }[]
      }
      send_welcome_email_async: {
        Args: { user_email: string; user_full_name: string }
        Returns: Json
      }
      setup_admin_for_current_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      setup_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_my_booking_safe: {
        Args: { booking_id: string; new_status?: string }
        Returns: boolean
      }
      update_my_booking_status: {
        Args: { booking_id: string; new_status: string }
        Returns: boolean
      }
      update_parking_space_status: {
        Args: {
          is_override?: boolean
          new_status: string
          override_reason?: string
          space_id: string
        }
        Returns: Json
      }
      validate_document_access: {
        Args: { requested_by?: string; verification_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled"
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
      booking_status: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
