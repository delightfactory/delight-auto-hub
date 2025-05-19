
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
  avatar_url?: string; // Added for profile picture
  preferences?: {
    notifications?: boolean;
    marketing?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: 'ar' | 'en';
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any | null }>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Function to clean up auth state - important to prevent session conflicts
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', userEmail)
        .single();
        
      if (data) {
        // Parse preferences if it exists and is a string
        let preferences = data.preferences || {};
        if (typeof preferences === 'string') {
          try {
            preferences = JSON.parse(preferences);
          } catch (e) {
            preferences = {};
          }
        }

        setUser({
          id: userId,
          email: userEmail,
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          avatar_url: data.avatar_url,
          preferences
        });
      } else if (error) {
        console.error("Error fetching user profile:", error);
        // If we don't find a profile, at least set the basic user data
        setUser({
          id: userId,
          email: userEmail
        });
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
    }
  };

  // Function to refresh session - can be called manually if needed
  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // When user signs in, fetch their profile after a small delay
          // This prevents potential deadlocks in Supabase client
          setTimeout(async () => {
            await fetchUserProfile(session.user.id, session.user.email || '');
            setLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Just log this event, no need to refetch profile
          console.log('Token refreshed successfully');
        }
      }
    );
    
    // Then check for an existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt to sign out globally first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global sign out failed, but continuing:', err);
      }
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({ 
          title: "خطأ في تسجيل الدخول", 
          description: error.message, 
          variant: "destructive" 
        });
        return { error };
      }
      
      if (data.user) {
        toast({ 
          title: "تم تسجيل الدخول بنجاح", 
          description: "مرحباً بك في ديلايت" 
        });
      }
      
      return { error: null };
    } catch (err) {
      console.error("signIn error", err);
      toast({ 
        title: "خطأ في تسجيل الدخول", 
        description: "حدث خطأ غير متوقع", 
        variant: "destructive" 
      });
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Register with Supabase Auth
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        toast({ 
          title: "خطأ في إنشاء الحساب", 
          description: authError.message, 
          variant: "destructive" 
        });
        return { error: authError };
      }
      
      // Create customer profile with default preferences
      if (data.user) {
        const { error: profileError } = await supabase
          .from('customers')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            preferences: {
              notifications: true,
              marketing: false,
              theme: 'system',
              language: 'ar'
            }
          });
          
        if (profileError) {
          toast({ 
            title: "خطأ في إنشاء الملف الشخصي", 
            description: profileError.message, 
            variant: "destructive" 
          });
          return { error: profileError };
        }
      }
      
      toast({ 
        title: "تم إنشاء الحساب بنجاح", 
        description: "مرحباً بك في ديلايت" 
      });
      
      return { error: null };
    } catch (error) {
      toast({ 
        title: "خطأ في إنشاء الحساب", 
        description: "حدث خطأ غير متوقع", 
        variant: "destructive" 
      });
      return { error };
    }
  };
  
  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Sign out from Supabase (attempt global scope)
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      
      // Force a page reload for clean state
      window.location.href = '/auth';
      
      toast({ title: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ 
        title: "خطأ في تسجيل الخروج", 
        description: "حدث خطأ غير متوقع", 
        variant: "destructive" 
      });
    }
  };
  
  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      return { error: new Error("يجب تسجيل الدخول لتحديث الملف الشخصي") };
    }
    
    try {
      // Prepare the update data
      const updateData: any = {};
      
      // Handle regular fields
      if (data.name !== undefined) updateData.name = data.name;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
      
      // Handle preferences - merge with existing preferences
      if (data.preferences) {
        // Get current preferences
        const currentPreferences = user.preferences || {};
        
        // Merge with new preferences
        updateData.preferences = {
          ...currentPreferences,
          ...data.preferences
        };
      }
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('email', user.email);
        
      if (error) {
        toast({ 
          title: "خطأ في تحديث الملف الشخصي", 
          description: error.message, 
          variant: "destructive" 
        });
        return { error };
      }
      
      // Update local state
      setUser({ ...user, ...data });
      
      toast({ title: "تم تحديث الملف الشخصي بنجاح" });
      
      return { error: null };
    } catch (error) {
      toast({ 
        title: "خطأ في تحديث الملف الشخصي", 
        description: "حدث خطأ غير متوقع", 
        variant: "destructive" 
      });
      return { error };
    }
  };
  
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
