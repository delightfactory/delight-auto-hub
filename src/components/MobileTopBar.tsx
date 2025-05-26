import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Link as RouterLink } from 'react-router-dom';

const MobileTopBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sm:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex items-center justify-between px-4 h-14">
      <RouterLink to="/" className="flex-shrink-0">
        <img 
          src="/lovable-uploads/7bb28241-5759-4c8e-8fd4-83cedb7bea1e.png" 
          alt="Delight Logo" 
          className="h-10 w-auto object-contain"
        />
      </RouterLink>
      <div className="flex-1 flex justify-end items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2">
          <Search className="w-6 h-6 text-gray-700" />
        </button>
        <NotificationCenter />
        <Link to="/profile" className="p-2">
          <User className="w-6 h-6 text-gray-700" />
        </Link>
      </div>
    </div>
  );
};

export default MobileTopBar;
