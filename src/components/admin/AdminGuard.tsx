
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check for admin status once auth is no longer loading
    const checkAdminStatus = async () => {
      if (loading) return;
      
      if (!user) {
        setIsAdmin(false);
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يرجى تسجيل الدخول للوصول إلى لوحة التحكم",
        });
        navigate('/auth', { state: { returnUrl: '/admin' } });
        return;
      }
      
      // Check if the user is an admin by querying the customers table
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('role')
          .eq('id', user.id)
          .single();
          
        const userIsAdmin = data?.role === 'admin';
        setIsAdmin(userIsAdmin);
        
        if (!userIsAdmin) {
          toast({
            title: "غير مصرح",
            description: "ليس لديك صلاحية الوصول إلى لوحة التحكم",
            variant: "destructive"
          });
          navigate('/');
        }
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          toast({
            title: "خطأ في التحقق",
            description: "حدث خطأ أثناء التحقق من الصلاحيات",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        setIsAdmin(false);
        navigate('/');
      }
    };
    
    checkAdminStatus();
  }, [user, loading, navigate, toast]);

  // Show loading state when authentication is being checked
  if (loading || isAdmin === null) {
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
