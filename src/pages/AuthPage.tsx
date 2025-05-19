
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import bgImage from '/assets/auth-bg.jpg';

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
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          alert("الرجاء إدخال الاسم");
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, name);
      }
      navigate('/');
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-delight-700 to-delight-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-delight-200/20 backdrop-blur-sm bg-white/90 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-delight-800">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</CardTitle>
            <CardDescription className="text-delight-600">
              {isLogin ? 'أهلاً بعودتك! سجل الدخول للوصول إلى حسابك' : 'أهلاً بك في ديلايت! أنشئ حسابك للاستمتاع بخدماتنا'}
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
                    <a href="#" className="text-sm text-delight-600 hover:text-delight-500">نسيت كلمة المرور؟</a>
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
                className="w-full bg-delight-600 hover:bg-delight-700 text-white"
                disabled={isSubmitting}
              >
                {isLogin 
                  ? (isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول') 
                  : (isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-delight-600 hover:text-delight-800"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? 'ليس لديك حساب؟ سجل الآن' 
                : 'لديك حساب بالفعل؟ سجل الدخول'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
