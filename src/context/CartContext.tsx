
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
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
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: '0 جنيه',
  itemCount: 0,
};

// Parse price string to number (e.g., "75 جنيه" -> 75)
const parsePrice = (priceString: string): number => {
  const numericPart = priceString.match(/\d+/);
  return numericPart ? parseInt(numericPart[0]) : 0;
};

// Format price number to string (e.g., 75 -> "75 جنيه")
const formatPrice = (price: number): string => {
  return `${price} جنيه`;
};

const calculateTotal = (items: CartItem[]): string => {
  const total = items.reduce((sum, item) => {
    return sum + parsePrice(item.price) * item.quantity;
  }, 0);
  return formatPrice(total);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: state.itemCount + 1,
        };
      } else {
        // New item
        const updatedItems = [...state.items, action.payload];
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: state.itemCount + 1,
        };
      }
    }

    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find((item) => item.id === action.payload);
      if (!itemToRemove) return state;

      const updatedItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: state.itemCount - itemToRemove.quantity,
      };
    }

    case 'UPDATE_QUANTITY': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex === -1) return state;

      const item = state.items[existingItemIndex];
      const quantityDiff = action.payload.quantity - item.quantity;

      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const updatedItems = state.items.filter((item) => item.id !== action.payload.id);
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: state.itemCount + quantityDiff,
        };
      }

      const updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: action.payload.quantity,
      };

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: state.itemCount + quantityDiff,
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, quantity: 1 },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
