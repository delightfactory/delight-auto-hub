
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
  product_code: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

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

// New interface definitions for the homepage dynamic content

export interface NavLink {
  id: string;
  title: string;
  url: string;
  order_position: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HeroSettings {
  id: string;
  title: string;
  subtitle?: string;
  background_image_url?: string;
  button_text?: string;
  button_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role?: string;
  company?: string;
  content: string;
  avatar_url?: string;
  order_position: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CTASettings {
  id: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  background_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FooterSettings {
  id: string;
  copyright_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  icon_name: string;
  profile_url: string;
  order_position: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
