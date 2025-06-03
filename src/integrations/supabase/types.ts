export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null;
          content: string;
          cover_image: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          likes: number;
          published: boolean | null;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          likes?: number;
          published?: boolean | null;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          likes?: number;
          published?: boolean | null;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      banners: {
        Row: {
          button_text: string | null;
          created_at: string;
          display_interval: number;
          display_order: number;
          end_at: string | null;
          id: string;
          image_url: string;
          is_active: boolean;
          link_url: string | null;
          pages: string[] | null;
          start_at: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          button_text?: string | null;
          created_at?: string;
          display_interval?: number;
          display_order?: number;
          end_at?: string | null;
          id?: string;
          image_url: string;
          is_active?: boolean;
          link_url?: string | null;
          pages?: string[] | null;
          start_at?: string | null;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          button_text?: string | null;
          created_at?: string;
          display_interval?: number;
          display_order?: number;
          end_at?: string | null;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          link_url?: string | null;
          pages?: string[] | null;
          start_at?: string | null;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          address: string | null;
          city_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          lat: number | null;
          lng: number | null;
          name: string;
          pickup_slots: Json | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name: string;
          pickup_slots?: Json | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          city_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          pickup_slots?: Json | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "branches_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          }
        ];
      };
      broadcast_notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          message: string;
          priority: number | null;
          target_role: string | null;
          title: string;
          type_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          message: string;
          priority?: number | null;
          target_role?: string | null;
          title: string;
          type_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          message?: string;
          priority?: number | null;
          target_role?: string | null;
          title?: string;
          type_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "broadcast_notifications_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "notification_types";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          image: string | null;
          name: string;
          parent_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image?: string | null;
          name: string;
          parent_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          parent_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      cities: {
        Row: {
          created_at: string;
          delivery_days: string[] | null;
          delivery_fee: number;
          governorate_id: string;
          id: string;
          is_active: boolean;
          name_ar: string;
          name_en: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          delivery_days?: string[] | null;
          delivery_fee?: number;
          governorate_id: string;
          id?: string;
          is_active?: boolean;
          name_ar: string;
          name_en: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          delivery_days?: string[] | null;
          delivery_fee?: number;
          governorate_id?: string;
          id?: string;
          is_active?: boolean;
          name_ar?: string;
          name_en?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cities_governorate_id_fkey";
            columns: ["governorate_id"];
            isOneToOne: false;
            referencedRelation: "governorates";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          article_id: string | null;
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          product_id: string | null;
          status: Database["public"]["Enums"]["comment_status"];
        };
        Insert: {
          article_id?: string | null;
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          product_id?: string | null;
          status?: Database["public"]["Enums"]["comment_status"];
        };
        Update: {
          article_id?: string | null;
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          product_id?: string | null;
          status?: Database["public"]["Enums"]["comment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_comments_article";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          created_at: string;
          email: string;
          governorate: string | null;
          id: string;
          location_coordinates: Json | null;
          location_description: string | null;
          name: string;
          phone: string | null;
          preferences: Json | null;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
          email: string;
          governorate?: string | null;
          id?: string;
          location_coordinates?: Json | null;
          location_description?: string | null;
          name: string;
          phone?: string | null;
          preferences?: Json | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string;
          governorate?: string | null;
          id?: string;
          location_coordinates?: Json | null;
          location_description?: string | null;
          name?: string;
          phone?: string | null;
          preferences?: Json | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      governorates: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name_ar: string;
          name_en: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name_ar: string;
          name_en: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name_ar?: string;
          name_en?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          created_at: string | null;
          email_enabled: boolean | null;
          id: string;
          in_app_enabled: boolean | null;
          push_enabled: boolean | null;
          type_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email_enabled?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          push_enabled?: boolean | null;
          type_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email_enabled?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          push_enabled?: boolean | null;
          type_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "notification_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_types: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          expires_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          priority: number | null;
          read_at: string | null;
          title: string;
          type_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          priority?: number | null;
          read_at?: string | null;
          title: string;
          type_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          priority?: number | null;
          read_at?: string | null;
          title?: string;
          type_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "notification_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          product_price?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          actual_delivery_date: string | null;
          created_at: string;
          customer_id: string;
          delivery_fee: number;
          estimated_delivery_date: string | null;
          id: string;
          notes: string | null;
          payment_method: string;
          pickup_branch_id: string | null;
          pickup_point_id: string | null;
          scheduled_datetime: string | null;
          shipping_address: string;
          shipping_city: string;
          shipping_company_id: string | null;
          shipping_cost: number;
          shipping_method_id: string | null;
          shipping_status: Database["public"]["Enums"]["order_shipping_status_enum"];
          status: Database["public"]["Enums"]["order_status_expanded_enum"];
          total_amount: number;
          tracking_number: string | null;
          updated_at: string;
          van_route_stop_id: string | null;
        };
        Insert: {
          actual_delivery_date?: string | null;
          created_at?: string;
          customer_id: string;
          delivery_fee?: number;
          estimated_delivery_date?: string | null;
          id?: string;
          notes?: string | null;
          payment_method: string;
          pickup_branch_id?: string | null;
          pickup_point_id?: string | null;
          scheduled_datetime?: string | null;
          shipping_address: string;
          shipping_city: string;
          shipping_company_id?: string | null;
          shipping_cost?: number;
          shipping_method_id?: string | null;
          shipping_status?: Database["public"]["Enums"]["order_shipping_status_enum"];
          status?: Database["public"]["Enums"]["order_status_expanded_enum"];
          total_amount: number;
          tracking_number?: string | null;
          updated_at?: string;
          van_route_stop_id?: string | null;
        };
        Update: {
          actual_delivery_date?: string | null;
          created_at?: string;
          customer_id?: string;
          delivery_fee?: number;
          estimated_delivery_date?: string | null;
          id?: string;
          notes?: string | null;
          payment_method?: string;
          pickup_branch_id?: string | null;
          pickup_point_id?: string | null;
          scheduled_datetime?: string | null;
          shipping_address?: string;
          shipping_city?: string;
          shipping_company_id?: string | null;
          shipping_cost?: number;
          shipping_method_id?: string | null;
          shipping_status?: Database["public"]["Enums"]["order_shipping_status_enum"];
          status?: Database["public"]["Enums"]["order_status_expanded_enum"];
          total_amount?: number;
          tracking_number?: string | null;
          updated_at?: string;
          van_route_stop_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_pickup_branch_id_fkey";
            columns: ["pickup_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_pickup_point_id_fkey";
            columns: ["pickup_point_id"];
            isOneToOne: false;
            referencedRelation: "pickup_points";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_company_id_fkey";
            columns: ["shipping_company_id"];
            isOneToOne: false;
            referencedRelation: "shipping_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_method_id_fkey";
            columns: ["shipping_method_id"];
            isOneToOne: false;
            referencedRelation: "shipping_methods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_van_route_stop_id_fkey";
            columns: ["van_route_stop_id"];
            isOneToOne: false;
            referencedRelation: "van_route_stops";
            referencedColumns: ["id"];
          }
        ];
      };
      pickup_points: {
        Row: {
          address: string | null;
          city_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          lat: number | null;
          lng: number | null;
          name: string;
          pickup_slots: Json | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name: string;
          pickup_slots?: Json | null;
          type: string;
          updated_at?: string[];
        };
        Update: {
          address?: string | null;
          city_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          pickup_slots?: Json | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pickup_points_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          discount_price: number | null;
          features: Json | null;
          height: number | null;
          id: string;
          images: string[] | null;
          is_featured: boolean | null;
          is_new: boolean | null;
          length: number | null;
          name: string;
          price: number;
          product_code: string;
          requires_shipping: boolean;
          stock: number | null;
          updated_at: string;
          usage_instructions: string | null;
          weight: number | null;
          width: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          discount_price?: number | null;
          features?: Json | null;
          height?: number | null;
          id?: string;
          images?: string[] | null;
          is_featured?: boolean | null;
          is_new?: boolean | null;
          length?: number | null;
          name: string;
          price: number;
          product_code: string;
          requires_shipping?: boolean;
          stock?: number | null;
          updated_at?: string;
          usage_instructions?: string | null;
          weight?: number | null;
          width?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          discount_price?: number | null;
          features?: Json | null;
          height?: number | null;
          id?: string;
          images?: string[] | null;
          is_featured?: boolean | null;
          is_new?: boolean | null;
          length?: number | null;
          name?: string;
          price?: number;
          product_code?: string;
          requires_shipping?: boolean;
          stock?: number | null;
          updated_at?: string;
          usage_instructions?: string | null;
          weight?: number | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_fkey";
            columns: ["category"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      shipping_companies: {
        Row: {
          base_fee: number;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          base_fee?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          base_fee?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_methods: {
        Row: {
          code: string;
          company_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          is_express: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_express?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_express?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipping_methods_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "shipping_companies";
            referencedColumns: ["id"];
          }
        ];
      };
      shipping_rate_rules: {
        Row: {
          city_id: string;
          created_at: string;
          fee: number;
          id: string;
          method_id: string;
          updated_at: string;
          weight_max: number;
          weight_min: number;
        };
        Insert: {
          city_id: string;
          created_at?: string;
          fee: number;
          id?: string;
          method_id: string;
          updated_at?: string;
          weight_max: number;
          weight_min: number;
        };
        Update: {
          city_id?: string;
          created_at?: string;
          fee?: number;
          id?: string;
          method_id?: string;
          updated_at?: string;
          weight_max?: number;
          weight_min?: number;
        };
        Relationships: [
          {
            foreignKeyName: "shipping_rate_rules_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipping_rate_rules_method_id_fkey";
            columns: ["method_id"];
            isOneToOne: false;
            referencedRelation: "shipping_methods";
            referencedColumns: ["id"];
          }
        ];
      };
      van_route_stops: {
        Row: {
          city_id: string;
          created_at: string;
          est_arrival_time: string;
          id: string;
          route_id: string;
          updated_at: string;
        };
        Insert: {
          city_id: string;
          created_at?: string;
          est_arrival_time: string;
          id?: string;
          route_id: string;
          updated_at?: string;
        };
        Update: {
          city_id?: string;
          created_at?: string;
          est_arrival_time?: string;
          id?: string;
          route_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "van_route_stops_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "van_route_stops_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "van_routes";
            referencedColumns: ["id"];
          }
        ];
      };
      van_routes: {
        Row: {
          created_at: string;
          day_of_week: number;
          id: string;
          is_active: boolean;
          title: string;
          updated_at: string;
          van_number: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          id?: string;
          is_active?: boolean;
          title: string;
          updated_at?: string;
          van_number: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          id?: string;
          is_active?: boolean;
          title?: string;
          updated_at?: string;
          van_number?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_shipping_fee: {
        Args: { p_city_id: string; p_weight: number; p_method_code: string };
        Returns: number;
      };
      delete_banner: {
        Args: { banner_id: string };
        Returns: boolean;
      };
      get_active_banners: {
        Args: { page_name: string };
        Returns: Array<{
          button_text: string | null;
          created_at: string;
          display_interval: number;
          display_order: number;
          end_at: string | null;
          id: string;
          image_url: string;
          is_active: boolean;
          link_url: string | null;
          pages: string[] | null;
          start_at: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
        }>;
      };
      get_shipping_options: {
        Args: { p_city_id: string; p_weight: number };
        Returns: Array<{
          method_id: string;
          method_code: string;
          method_title: string;
          company_id: string;
          company_name: string;
          fee: number;
        }>;
      };
      get_unread_notifications_count: {
        Args: { p_user_id?: string };
        Returns: number;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mark_notification_as_read: {
        Args: { p_notification_id: string };
        Returns: boolean;
      };
      send_broadcast_notification: {
        Args: {
          p_type_name: string;
          p_title: string;
          p_message: string;
          p_target_role?: string;
          p_data?: Json;
          p_priority?: number;
          p_expires_at?: string;
        };
        Returns: string;
      };
      send_notification: {
        Args: {
          p_user_id: string;
          p_type_name: string;
          p_title: string;
          p_message: string;
          p_data?: Json;
          p_priority?: number;
        };
        Returns: string;
      };
    };
    Enums: {
      comment_status: "approved" | "pending" | "spam";
      order_shipping_status_enum:
        | "pending"
        | "ready_for_shipping"
        | "shipped"
        | "out_for_delivery"
        | "ready_for_pickup"
        | "picked_up"
        | "delivered"
        | "cancelled"
        | "returned";
      order_status_expanded_enum:
        | "pending"
        | "paid"
        | "processing"
        | "ready_for_shipping"
        | "ready_for_pickup"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "failed_delivery";
      user_role: "admin" | "customer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
      )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (
      DefaultSchema["Tables"] &
      DefaultSchema["Views"]
    )
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      comment_status: ["approved", "pending", "spam"],
      order_shipping_status_enum: [
        "pending",
        "ready_for_shipping",
        "shipped",
        "out_for_delivery",
        "ready_for_pickup",
        "picked_up",
        "delivered",
        "cancelled",
        "returned",
      ],
      order_status_expanded_enum: [
        "pending",
        "paid",
        "processing",
        "ready_for_shipping",
        "ready_for_pickup",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed_delivery",
      ],
      user_role: ["admin", "customer"],
    },
  },
} as const;
