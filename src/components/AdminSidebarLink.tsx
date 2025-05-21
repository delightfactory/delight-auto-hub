
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';

interface AdminSidebarLinkProps {
  children: React.ReactNode;
}

const AdminSidebarLink: React.FC<AdminSidebarLinkProps> = ({ children }) => {
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
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h3 className="px-3 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">لوحة التحكم</h3>
      <Link
        to="/admin"
        className="flex items-center justify-between px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <span>الذهاب إلى لوحة التحكم</span>
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default AdminSidebarLink;
