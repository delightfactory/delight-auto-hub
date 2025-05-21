
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isUserAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_admin');
          
        if (error) {
          console.error("Error checking admin status:", error);
          return false;
        }
        
        return data || false;
      } catch (err) {
        console.error("Error in admin check:", err);
        return false;
      }
    },
    enabled: !!user && !loading,
  });

  useEffect(() => {
    if (!loading && !isCheckingAdmin) {
      if (!user) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يرجى تسجيل الدخول للوصول إلى لوحة التحكم",
        });
        navigate('/auth', { state: { returnUrl: '/admin' } });
        return;
      }
      
      if (isAdmin === false) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية الوصول إلى لوحة التحكم",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [user, loading, isAdmin, isCheckingAdmin, navigate, toast]);

  // Show loading state when authentication is being checked
  if (loading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 text-red-600 animate-spin" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            التحقق من الصلاحيات...
          </p>
        </div>
      </div>
    );
  }

  // Only render children if user is admin
  return isAdmin ? <>{children}</> : null;
};

export default AdminGuard;
