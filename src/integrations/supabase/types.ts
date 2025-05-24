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
      articles: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          likes: number
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          likes?: number
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          likes?: number
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: number | null
          target_role: string | null
          title: string
          type_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: number | null
          target_role?: string | null
          title: string
          type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: number | null
          target_role?: string | null
          title?: string
          type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_notifications_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string | null
          author_id: string
          content: string
          created_at: string
          id: string
          product_id: string | null
          status: Database["public"]["Enums"]["comment_status"]
        }
        Insert: {
          article_id?: string | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          product_id?: string | null
          status?: Database["public"]["Enums"]["comment_status"]
        }
        Update: {
          article_id?: string | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          product_id?: string | null
          status?: Database["public"]["Enums"]["comment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comments_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          location_coordinates: Json | null
          name: string
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          location_coordinates?: Json | null
          name: string
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          location_coordinates?: Json | null
          name?: string
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          type_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: number | null
          read_at: string | null
          title: string
          type_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: number | null
          read_at?: string | null
          title: string
          type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: number | null
          read_at?: string | null
          title?: string
          type_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_method: string
          shipping_address: string
          shipping_city: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_method: string
          shipping_address: string
          shipping_city: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_method?: string
          shipping_address?: string
          shipping_city?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          features: Json | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          price: number
          product_code: string
          stock: number | null
          updated_at: string
          usage_instructions: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          features?: Json | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          price: number
          product_code: string
          stock?: number | null
          updated_at?: string
          usage_instructions?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          features?: Json | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          price?: number
          product_code?: string
          stock?: number | null
          updated_at?: string
          usage_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_notifications_count: {
        Args: { p_user_id?: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      send_broadcast_notification: {
        Args: {
          p_type_name: string
          p_title: string
          p_message: string
          p_target_role?: string
          p_data?: Json
          p_priority?: number
          p_expires_at?: string
        }
        Returns: string
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_type_name: string
          p_title: string
          p_message: string
          p_data?: Json
          p_priority?: number
        }
        Returns: string
      }
    }
    Enums: {
      comment_status: "approved" | "pending" | "spam"
      user_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      comment_status: ["approved", "pending", "spam"],
      user_role: ["admin", "customer"],
    },
  },
} as const
