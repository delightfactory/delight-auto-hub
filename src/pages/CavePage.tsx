import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, LogIn, Ticket, HelpCircle, Zap, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCaveAudio } from '@/components/cave/CaveAudioEffects';
import EnhancedCaveHeader from '@/components/cave/EnhancedCaveHeader';
import { caveAnimations } from '@/components/cave/caveAnimations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { caveService } from '@/services/caveService';
import type { CaveEvent } from '@/types/db';

const CavePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const caveAudio = useCaveAudio();

  const [activeTab, setActiveTab] = useState('events');
  const [ticketCode, setTicketCode] = useState('');
  const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const { data: activeEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['cave-active-events'],
    queryFn: caveService.getActiveEvents
  });

  const { data: activeSession, refetch: refetchSession } = useQuery({
    queryKey: ['cave-active-session', user?.id],
    queryFn: () => (user?.id ? caveService.getActiveUserSession(user.id) : Promise.resolve(null)),
    enabled: !!user?.id
  });

  const { data: activeEventDetails } = useQuery({
    queryKey: ['cave-event', activeSession?.event_id],
    queryFn: () => (activeSession ? caveService.getEventById(activeSession.event_id) : Promise.resolve(null)),
    enabled: !!activeSession?.event_id
  });

  const remainingCap = activeEventDetails && activeSession ? activeEventDetails.purchase_cap - activeSession.total_spent : 0;

  const createSessionMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!user?.id) throw new Error('يجب تسجيل الدخول أولاً');
      return caveService.createSession({ userId: user.id, eventId });
    },
    onSuccess: (newSession) => {
      toast({ title: 'تم الدخول بنجاح!', description: 'جاري نقلك إلى صفحة الكنوز...' });
      queryClient.invalidateQueries({ queryKey: ['cave-active-session'] });
      caveAudio.playCaveDoor();
      navigate(`/cave/products/${newSession.session_id}`);
    },
    onError: (e: any) => {
      toast({ title: 'خطأ في الدخول إلى المغارة', description: e.message || 'حدث خطأ أثناء محاولة الدخول.', variant: 'destructive' });
    }
  });

  const validateTicketMutation = useMutation({
    mutationFn: (code: string) => caveService.validateTicket(code, user?.id || ''),
    onSuccess: (data) => {
      if (data.valid && data.event) {
        toast({ title: 'تم التحقق من التذكرة بنجاح' });
        caveAudio.playTreasureFound();
        createSessionMutation.mutate(data.event.event_id);
      } else {
        toast({ title: 'التذكرة غير صالحة', description: data.message || '', variant: 'destructive' });
      }
    },
    onError: () => {
      toast({ title: 'خطأ في التحقق من التذكرة', variant: 'destructive' });
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: () => {
      if (!activeSession?.session_id) throw new Error('لا توجد جلسة نشطة');
      return caveService.endSession(activeSession.session_id, activeSession.total_spent);
    },
    onSuccess: () => {
      toast({ title: 'تم الخروج من المغارة بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['cave-active-session'] });
      refetchSession();
    },
    onError: () => {
      toast({ title: 'خطأ في الخروج من المغارة', variant: 'destructive' });
    }
  });

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      const expiry = new Date(activeSession.expires_at).getTime();
      const now = Date.now();
      const remainingMs = expiry - now;
      if (remainingMs <= 0) {
        clearInterval(timer);
        endSessionMutation.mutate();
        return;
      }
      setRemainingTime({
        hours: Math.floor(remainingMs / 3600000),
        minutes: Math.floor((remainingMs % 3600000) / 60000),
        seconds: Math.floor((remainingMs % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, endSessionMutation]);

  const handleEnterCave = (eventId: string) => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    if (activeSession) {
      if (activeSession.event_id === eventId) {
        caveAudio.playCaveDoor();
        navigate(`/cave/products/${activeSession.session_id}`);
      } else {
        toast({ title: 'لديك جلسة نشطة في حدث آخر', variant: 'warning' });
      }
      return;
    }
    createSessionMutation.mutate(eventId);
  };

  const handleExitCave = () => endSessionMutation.mutate();

  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div className="min-h-screen relative bg-[url('/images/cave-bg.webp')] bg-cover bg-fixed text-white font-cairo" dir="rtl">
      {activeSession && (
        <EnhancedCaveHeader
          session={activeSession}
          event={activeEventDetails}
          remainingTime={remainingTime}
          purchaseLimit={{ remaining: remainingCap, total: activeEventDetails?.purchase_cap || 0 }}
          userPoints={200}
        />
      )}

      <section className="cave-container pt-24 pb-32 text-center space-y-6">
        <CaveParticles count={15} duration={10} colors={['#FFD700', '#FFA500', '#B8860B']} />
        <motion.h1 className="text-4xl md:text-5xl cave-font-primary cave-enhanced-glow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          كنوز المغارة
        </motion.h1>
        <motion.p className="max-w-2xl mx-auto text-lg text-gray-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          اكتشف أندر الكنوز والعروض الحصرية داخل أعماق مغارتنا الغامضة.
        </motion.p>
        <motion.button
          className="cave-enhanced-buy-button px-8 py-3 rounded-full"
          whileHover={{ scale: 1.05 }}
          onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          استعرض الأحداث
        </motion.button>
      </section>

      <section id="events-section" className="cave-container pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="events">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-cave-bg-secondary/40 border border-cave-secondary-dark shadow-sm">
              <TabsTrigger value="events" className="text-white data-[state=active]:bg-cave-primary data-[state=active]:text-black">
                الأحداث المتاحة
              </TabsTrigger>
              <TabsTrigger value="ticket" className="text-white data-[state=active]:bg-cave-primary data-[state=active]:text-black">
                استخدم تذكرة
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events">
            {isLoadingEvents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-400 mx-auto" />
              </div>
            ) : activeEvents && activeEvents.length > 0 ? (
              <div className="cave-grid">
                {activeEvents.map(event => (
                  <motion.div key={event.event_id} className="cave-enhanced-card overflow-hidden" {...caveAnimations.fadeInUp}>
                    <div className="cave-enhanced-card-inner space-y-3 p-6">
                      <h3 className="cave-enhanced-title text-xl font-extrabold">{event.title}</h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                          <Calendar className="w-4 h-4 text-purple-400" /> {formatDateTime(event.start_time)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                          <Clock className="w-4 h-4 text-purple-400" /> {formatDateTime(event.end_time)}
                        </Badge>
                      </div>
                      <button className="cave-enhanced-buy-button w-full" onClick={() => handleEnterCave(event.event_id)}>
                        <LogIn className="mr-1 h-4 w-4" /> ادخل الآن
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-300">لا توجد أحداث متاحة حالياً</div>
            )}
          </TabsContent>

          <TabsContent value="ticket">
            <motion.div className="cave-enhanced-card max-w-xl mx-auto p-6 space-y-4" {...caveAnimations.fadeInUp}>
              <p className="text-center text-lg">أدخل رمز التذكرة للدخول إلى حدث خاص</p>
              <div className="flex items-stretch gap-4">
                <Input value={ticketCode} onChange={e => setTicketCode(e.target.value)} placeholder="أدخل رمز التذكرة..." className="flex-grow bg-amber-50/10 border border-amber-600/30 text-center" />
                <button className="cave-enhanced-buy-button px-6" onClick={() => validateTicketMutation.mutate(ticketCode)} disabled={validateTicketMutation.isPending}>
                  {validateTicketMutation.isPending ? 'جاري التحقق...' : 'تحقق'}
                </button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="cave-container pb-24 grid md:grid-cols-3 gap-8 text-center">
        <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full">
          <div className="cave-enhanced-card-inner p-8">
            <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
            <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">كيف تعمل المغارة؟</h3>
            <p className="text-gray-300">المغارة هي مساحة خاصة تتيح لك الوصول إلى منتجات حصرية وعروض خاصة. يمكنك الدخول من خلال الأحداث المجدولة أو باستخدام تذكرة.</p>
          </div>
        </motion.div>
        <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full" transition={{ delay: 0.1 }}>
          <div className="cave-enhanced-card-inner p-8">
            <Zap className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
            <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">الأحداث المجدولة</h3>
            <p className="text-gray-300">الأحداث المجدولة هي فترات زمنية محددة يمكن للجميع الدخول فيها إلى المغارة. التزم بالوقت للاستفادة من العروض.</p>
          </div>
        </motion.div>
        <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full" transition={{ delay: 0.2 }}>
          <div className="cave-enhanced-card-inner p-8">
            <KeyRound className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
            <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">التذاكر الخاصة</h3>
            <p className="text-gray-300">التذاكر الخاصة تتيح لك الدخول إلى أحداث محددة تحصل عليها عبر العروض الترويجية أو كمكافأة على مشترياتك.</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default CavePage;
