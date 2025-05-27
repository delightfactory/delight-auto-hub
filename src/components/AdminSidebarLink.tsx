import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';

interface AdminSidebarLinkProps {
  onLinkClick?: () => void;
}

const AdminSidebarLink: React.FC<AdminSidebarLinkProps> = ({ onLinkClick }) => {
  const { user } = useAuth();
  
  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['isUserAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        // Use the is_admin function we created in the database
        const { data, error } = await supabase
          .rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          return false;
        }
        
        return data || false;
      } catch (error) {
        console.error("Error in admin check:", error);
        return false;
      }
    },
    enabled: !!user,
  });
  
  if (!user || isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <Link
        to="/admin"
        className="text-red-600 hover:underline"
        onClick={() => onLinkClick?.()}
      >
        لوحة التحكم
      </Link>
    </div>
  );
};

export default AdminSidebarLink;
