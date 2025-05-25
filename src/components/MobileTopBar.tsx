import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const MobileTopBar: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="sm:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex items-center justify-between px-4 h-14">
      <button onClick={() => navigate('/products')} className="p-1">
        <Search className="w-6 h-6 text-gray-700" />
      </button>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/checkout')} className="relative p-1">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        <Link to="/profile" className="p-1">
          <User className="w-6 h-6 text-gray-700" />
        </Link>
      </div>
    </div>
  );
};

export default MobileTopBar;
