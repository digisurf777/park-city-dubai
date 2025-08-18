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
          {
            foreignKeyName: "driver_owner_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "parking_listings_public"
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
      profiles: {
        Row: {
          created_at: string
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
          created_at: string
          document_image_url: string
          document_type: string
          full_name: string
          id: string
          nationality: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          document_image_url: string
          document_type: string
          full_name: string
          id?: string
          nationality?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          document_image_url?: string
          document_type?: string
          full_name?: string
          id?: string
          nationality?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
    }
    Views: {
      parking_listings_public: {
        Row: {
          address: string | null
          availability_schedule: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string | null
          images: string[] | null
          owner_id: string | null
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
          contact_email?: never
          contact_phone?: never
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string | null
          images?: string[] | null
          owner_id?: never
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
          contact_email?: never
          contact_phone?: never
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string | null
          images?: string[] | null
          owner_id?: never
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
    }
    Functions: {
      expire_booking_chats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_unconfirmed_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      setup_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
