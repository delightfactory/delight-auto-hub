// Auto-generated shared types for database entities

export interface Product {
  id: string;
  name: string;
  description?: string;
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
