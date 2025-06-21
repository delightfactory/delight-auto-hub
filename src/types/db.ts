// Auto-generated shared types for database entities

export interface Product {
  id: string;
  name: string;
  description?: string;
  /** عنوان مختصر للوصف */
  description_title?: string;
  price: number;
  discount_price?: number;
  stock?: number;
  category: string | null;  // UUID reference to Category
  is_featured: boolean;
  is_new: boolean;
  features?: string[];
  images?: string[];
  usage_instructions?: string;
  product_code: string;
  brand?: string;
  subtype?: string;
  vendor?: string;
  country_of_origin?: string;
  video_url?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  points_earned?: number;
  points_required?: number;
  cave_enabled?: boolean;
  cave_price?: number;
  cave_required_points?: number;
  cave_max_quantity?: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'ready_for_shipping'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed_delivery';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;       // UUID reference to Product
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteDescription?: string;
  contactEmail: string;
  phoneNumber?: string;
  address?: string;
  enableRegistration: boolean;
  enableComments: boolean;
  theme?: ThemeSettings;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
}

export interface AppearanceSettings {
  id?: string;
  theme: ThemeSettings;
  layout: 'fluid' | 'fixed' | 'boxed';
  contentWidth: 'small' | 'medium' | 'large';
  darkMode: boolean;
  responsive: {
    mobile: { enabled: boolean; collapsibleMenu: boolean };
    tablet: { enabled: boolean; sidebarMenu: boolean };
    desktop: { enabled: boolean; topMenu: boolean };
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
  favicon?: string;
  homeSettings: {
    showBanner: boolean;
    showFeaturedProducts: boolean;
    showNewProducts: boolean;
    showTestimonials: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar_url?: string | null;
  };
  product?: {
    name: string;
  };
  article?: {
    title: string;
    slug: string;
  };
  status: 'approved' | 'pending' | 'spam';
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  display_order: number;
  pages: string[] | string;
  display_interval: number;
  start_at?: string;
  end_at?: string;
  created_at: string;
  updated_at: string;
}

// تعريف واجهة الفئة الهرمية
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  icon?: string | null;
  parent_id?: string | null;
  created_at: string;
  updated_at?: string;
}

// واجهة شجرة الفئات لدعم الهيكل الهرمي
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

// إضافة واجهات Favorite و Review لدعم الجداول الجديدة
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  approved: boolean;
}

// تعريف واجهات المدن والمحافظات
export interface City {
  name_ar: string;
  name_en: string;
  id?: string;
  governorate_id?: string;
  delivery_fee?: number;
  is_active?: boolean;
  delivery_days?: string[] | null;
}

export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  cities: City[];
  is_active?: boolean;
}

// واجهات نظام المغارة (Treasure Cave)
export interface CaveEvent {
  event_id: string;
  kind: 'scheduled' | 'ticketed';
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  max_concurrent: number;
  user_time_limit: number;
  purchase_cap: number;
  /** الحد الأقصى لمرات دخول المستخدم */
  max_participations_per_user: number;
  allowed_pay: 'points' | 'cash' | 'both';
  created_at: string;
}

export interface CaveTicket {
  ticket_id: string;
  event_id: string;
  code: string;
  max_use: number;
  per_user_limit: number;
  is_personal: boolean;
  owner_user?: string;
  is_active: boolean;
  expiry?: string;
  created_at: string;
}

export interface CaveSession {
  session_id: string;
  event_id: string;
  user_id: string;
  entered_at: string;
  expires_at: string;
  left_at?: string;
  total_spent: number;
}

export interface CaveOrder {
  order_id: string;
  event_id: string;
  session_id: string;
  user_id: string;
  amount: number;
  paid_with: 'points' | 'cash' | 'both';
  created_at: string;
}
