/**
 * سياق السلة - يوفر وظائف إدارة سلة التسوق في التطبيق
 * يتضمن إضافة وإزالة وتحديث المنتجات وحساب الإجمالي
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string; // السعر الأصلي قبل الخصم (اختياري)
  image: string;
  quantity: number;
  stock?: number; // كمية المخزون المتوفرة (اختياري)
}

interface CartState {
  items: CartItem[];
  total: string;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  total: '0 جنيه',
  itemCount: 0,
};

// Parse price string to number (supports commas and decimal points)
const parsePrice = (priceString: string): number => {
  if (!priceString) return 0;
  // استخراج الأرقام والنقطة العشرية فقط
  const digitsOnly = priceString.replace(/[^\d.]/g, '');
  return parseFloat(digitsOnly) || 0;
};

// طباعة معلومات التصحيح
const logDebugInfo = (message: string, data: any) => {
  console.log(`[CartContext Debug] ${message}:`, data);
};

// Format price number to string (e.g., 75 -> "75 جنيه")
const formatPrice = (price: number): string => {
  // Use English locale for number formatting
  return `${price.toLocaleString('en-US')} جنيه`;
};

const calculateTotal = (items: CartItem[]): string => {
  const total = items.reduce((sum, item) => {
    return sum + parsePrice(item.price) * item.quantity;
  }, 0);
  return formatPrice(total);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * مخفض السلة - يدير حالة السلة بناءً على الإجراءات المختلفة
 * يتعامل مع إضافة وإزالة وتحديث المنتجات وتحميل السلة المحفوظة
 */
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    // تحميل السلة من التخزين المحلي
    case 'LOAD_CART':
      return action.payload;

    case 'ADD_ITEM': {
      // طباعة معلومات المنتج المضاف للتصحيح
      logDebugInfo('Adding item to cart', action.payload);
      logDebugInfo('Item has originalPrice', !!action.payload.originalPrice);
      
      // التحقق من توفر المنتج في المخزون إذا كانت معلومات المخزون متوفرة
      if (action.payload.stock !== undefined && action.payload.stock <= 0) {
        console.warn(`محاولة إضافة منتج غير متوفر في cartReducer: ${action.payload.name}`);
        return state; // لا تغيير في الحالة
      }
      
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        // المنتج موجود بالفعل، زيادة الكمية فقط
        
        // التحقق من أن الكمية المطلوبة لا تتجاوز المخزون المتوفر
        const currentItem = state.items[existingItemIndex];
        const newQuantity = currentItem.quantity + 1;
        
        // إذا كانت معلومات المخزون متوفرة، تحقق من أن الكمية لا تتجاوز المخزون
        if (action.payload.stock !== undefined && newQuantity > action.payload.stock) {
          console.warn(`محاولة إضافة كمية تتجاوز المخزون المتوفر: ${action.payload.name}`);
          return state; // لا تغيير في الحالة
        }
        
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };
        
        logDebugInfo('Updated existing item', updatedItems[existingItemIndex]);

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        };
      } else {
        // منتج جديد
        // التأكد من أن المنتج يحتوي على المعلومات المطلوبة
        const newItem = {
          ...action.payload,
          quantity: action.payload.quantity || 1, // التأكد من وجود كمية
        };
        
        // طباعة معلومات المنتج الجديد
        logDebugInfo('New item added', newItem);
        
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex === -1) return state;

      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const updatedItems = state.items.filter((item) => item.id !== action.payload.id);
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        };
      }

      const updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: action.payload.quantity,
      };

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalValue: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * مزود سياق السلة - يوفر الوظائف والبيانات المتعلقة بالسلة لجميع المكونات
 * يتعامل مع تخزين واسترجاع السلة من التخزين المحلي
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // التأكد من صحة البيانات المحفوظة
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          return {
            items: parsedCart.items,
            total: calculateTotal(parsedCart.items),
            itemCount: calculateItemCount(parsedCart.items),
          };
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل السلة من التخزين المحلي:', error);
    }
    return initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
      console.error('خطأ في حفظ السلة:', error);
    }
  }, [state]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    // التحقق من توفر المنتج في المخزون (إذا كانت معلومات المخزون متوفرة)
    if (item.stock !== undefined && item.stock <= 0) {
      // لا نضيف المنتج إذا كان غير متوفر في المخزون
      console.warn(`محاولة إضافة منتج غير متوفر: ${item.name}`);
      return;
    }
    
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, quantity: 1 },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    // التحقق من أن الكمية الجديدة لا تتجاوز المخزون المتوفر
    const item = state.items.find(item => item.id === id);
    
    if (item && item.stock !== undefined && quantity > item.stock) {
      // إذا كانت الكمية المطلوبة تتجاوز المخزون المتوفر
      console.warn(`محاولة تحديث كمية تتجاوز المخزون المتوفر: ${item.name}, المخزون: ${item.stock}, الكمية المطلوبة: ${quantity}`);
      
      // تحديث الكمية إلى الحد الأقصى المتوفر
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: item.stock } });
      return;
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalValue = (): number => {
    return parsePrice(state.total);
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalValue,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * خطاف استخدام السلة - يوفر وصولاً سهلاً لسياق السلة من أي مكون
 * يمكن استخدامه للوصول إلى المنتجات والإجمالي ووظائف إدارة السلة
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
