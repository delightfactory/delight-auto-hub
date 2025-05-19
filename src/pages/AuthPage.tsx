
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!isLogin && !name.trim()) {
        alert("الرجاء إدخال الاسم");
        setIsSubmitting(false);
        return;
      }

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">الاسم</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input 
                      id="name"
                      placeholder="أدخل اسمك الكامل" 
                      className="pr-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني" 
                    className="pr-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium">كلمة المرور</Label>
                  {isLogin && (
                    <button 
                      type="button" 
                      className="text-sm text-red-600 hover:text-red-500"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('سيتم تفعيل هذه الخاصية قريباً');
                      }}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••" 
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                  </span>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
                )}
              </Button>
            </form>
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
