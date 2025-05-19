import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check active session on mount
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from customers table
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: data.name,
            phone: data.phone,
            address: data.address,
            city: data.city
          });
        } else {
          // If no profile exists, just use the auth data
          setUser({
            id: session.user.id,
            email: session.user.email || ''
          });
        }
      }
      setLoading(false);
    };
    
    getSession();
    
    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // When user signs in, fetch their profile
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: data.name,
            phone: data.phone,
            address: data.address,
            city: data.city
          });
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || ''
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
        return { error };
      }
      const authUser = data.user;
      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (!profileError && profileData) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            city: profileData.city,
          });
        } else {
          setUser({ id: authUser.id, email: authUser.email });
        }
      }
      toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في ديلايت" });
      return { error: null };
    } catch (err) {
      console.error("signIn error", err);
      toast({ title: "خطأ في تسجيل الدخول", description: "حدث خطأ غير متوقع", variant: "destructive" });
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Register with Supabase Auth
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        toast({ title: "خطأ في إنشاء الحساب", description: authError.message, variant: "destructive" });
        return { error: authError };
      }
      
      // Create customer profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('customers')
          .insert({
            id: data.user.id,
            email: email,
            name: name
          });
          
        if (profileError) {
          toast({ title: "خطأ في إنشاء الملف الشخصي", description: profileError.message, variant: "destructive" });
          return { error: profileError };
        }
      }
      
      toast({ title: "تم إنشاء الحساب بنجاح", description: "مرحباً بك في ديلايت" });
      
      return { error: null };
    } catch (error) {
      toast({ title: "خطأ في إنشاء الحساب", description: "حدث خطأ غير متوقع", variant: "destructive" });
      return { error };
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      toast({ title: "خطأ في تسجيل الخروج", description: "حدث خطأ غير متوقع", variant: "destructive" });
    }
  };
  
  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      return { error: new Error("يجب تسجيل الدخول لتحديث الملف الشخصي") };
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city
        })
        .eq('email', user.email);
        
      if (error) {
        toast({ title: "خطأ في تحديث الملف الشخصي", description: error.message, variant: "destructive" });
        return { error };
      }
      
      // Update local state
      setUser({ ...user, ...data });
      
      toast({ title: "تم تحديث الملف الشخصي بنجاح" });
      
      return { error: null };
    } catch (error) {
      toast({ title: "خطأ في تحديث الملف الشخصي", description: "حدث خطأ غير متوقع", variant: "destructive" });
      return { error };
    }
  };
  
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
