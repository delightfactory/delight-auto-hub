
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { OptimizedForm } from '@/components/performance/OptimizedForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (values: Record<string, string>) => {
    setIsSubmitting(true);

    try {
      const { email, password, name } = values;
      
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, name);

      if (result.error) {
        console.error("Authentication error:", result.error);
        setIsSubmitting(false);
        return;
      }

      navigate('/');
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-700 to-red-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-red-600 h-2 w-full"></div>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-red-600 mb-2">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin 
                ? 'أهلاً بعودتك! سجل الدخول للوصول إلى حسابك' 
                : 'أهلاً بك! أنشئ حسابك للاستمتاع بخدماتنا'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <OptimizedForm
                fields={[
                  {
                    name: 'email',
                    label: 'البريد الإلكتروني',
                    type: 'email' as const,
                    placeholder: 'أدخل بريدك الإلكتروني',
                    required: true,
                    validation: (value) => {
                      if (!/\S+@\S+\.\S+/.test(value)) {
                        return 'يرجى إدخال بريد إلكتروني صحيح';
                      }
                      return null;
                    }
                  },
                  {
                    name: 'password',
                    label: 'كلمة المرور',
                    type: 'password' as const,
                    placeholder: '••••••••',
                    required: true,
                    validation: (value) => {
                      if (value.length < 6) {
                        return 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
                      }
                      return null;
                    }
                  }
                ]}
                onSubmit={handleSubmit}
                submitLabel={isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                className="space-y-4"
              />
            ) : (
              <OptimizedForm
                fields={[
                  {
                    name: 'name',
                    label: 'الاسم',
                    type: 'text' as const,
                    placeholder: 'أدخل اسمك الكامل',
                    required: true
                  },
                  {
                    name: 'email',
                    label: 'البريد الإلكتروني',
                    type: 'email' as const,
                    placeholder: 'أدخل بريدك الإلكتروني',
                    required: true,
                    validation: (value) => {
                      if (!/\S+@\S+\.\S+/.test(value)) {
                        return 'يرجى إدخال بريد إلكتروني صحيح';
                      }
                      return null;
                    }
                  },
                  {
                    name: 'password',
                    label: 'كلمة المرور',
                    type: 'password' as const,
                    placeholder: '••••••••',
                    required: true,
                    validation: (value) => {
                      if (value.length < 6) {
                        return 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
                      }
                      return null;
                    }
                  }
                ]}
                onSubmit={handleSubmit}
                submitLabel={isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                className="space-y-4"
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-red-600 hover:text-red-800"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? 'ليس لديك حساب؟ سجل الآن' 
                : 'لديك حساب بالفعل؟ سجل الدخول'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
