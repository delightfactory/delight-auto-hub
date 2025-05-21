// Auto-generated shared types for database entities

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock?: number;
  category: string;         // UUID reference to Category
  is_featured: boolean;
  is_new: boolean;
  features?: string[];
  images?: string[];
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
