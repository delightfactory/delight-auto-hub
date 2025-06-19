import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, LogIn, LogOut, Ticket, X, HelpCircle, Zap, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCaveAudio } from '@/components/cave/CaveAudioEffects';
import CaveParticles from '@/components/cave/CaveParticles';
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
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CaveEvent | null>(null);
  const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  const { data: activeEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['cave-active-events'],
    queryFn: caveService.getActiveEvents
  });

  const { data: activeSession, isLoading: isLoadingSession, refetch: refetchSession } = useQuery({
    queryKey: ['cave-active-session', user?.id],
    queryFn: () => user?.id ? caveService.getActiveUserSession(user.id) : Promise.resolve(null),
    enabled: !!user?.id
  });

  const { data: activeEventDetails } = useQuery({
    queryKey: ['cave-event', activeSession?.event_id],
    queryFn: () => activeSession ? caveService.getEventById(activeSession.event_id) : Promise.resolve(null),
    enabled: !!activeSession?.event_id
  });

  const remainingCap = activeEventDetails && activeSession
    ? activeEventDetails.purchase_cap - activeSession.total_spent
    : 0;

  const { data: userSessions = [] } = useQuery({
    queryKey: ['cave-user-sessions', user?.id],
    queryFn: () => user ? caveService.getSessions(undefined, user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

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
        setIsTicketDialogOpen(false);
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
        seconds: Math.floor((remainingMs % 60000) / 1000),
        total: Math.floor(remainingMs / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, endSessionMutation]);

  const handleValidateTicket = () => {
    const trimmed = ticketCode.trim();
    if (!trimmed) {
      toast({ title: 'الرجاء إدخال رمز التذكرة', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    validateTicketMutation.mutate(trimmed);
  };

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
        toast({ title: 'لديك جلسة نشطة في حدث آخر', description: activeEventDetails?.title, variant: 'warning' });
      }
      return;
    }
    createSessionMutation.mutate(eventId);
  };

  const handleExitCave = () => endSessionMutation.mutate();

  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });

  if (isLoadingSession) {
    return (
      <div className="flex flex-col justify-center items-center h-screen cave-enhanced-bg text-white font-cairo">
        <Gem className="w-16 h-16 text-purple-400 animate-pulse cave-enhanced-glow" />
        <p className="mt-4 text-xl">جاري استكشاف المغارة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen cave-enhanced-bg text-white font-cairo" dir="rtl">
      {activeSession && (
        <>
          <EnhancedCaveHeader
            session={activeSession}
            event={activeEventDetails}
            remainingTime={{ hours: remainingTime.hours, minutes: remainingTime.minutes, seconds: remainingTime.seconds }}
            purchaseLimit={{ remaining: remainingCap, total: activeEventDetails?.purchase_cap || 0 }}
            userPoints={200}
          />
          <div className="mt-2 flex gap-2 justify-center">
            <button className="cave-enhanced-buy-button" onClick={() => navigate(`/cave/products/${activeSession.session_id}`)}>
              <LogIn className="mr-1 h-4 w-4" /> الدخول إلى الكنوز
            </button>
            <button className="cave-enhanced-buy-button bg-red-600 hover:bg-red-700" onClick={handleExitCave}>
              <LogOut className="mr-1 h-4 w-4" /> خروج من المغارة
            </button>
          </div>
        </>
      )}

      <div className="cave-container py-12">
        <section className="relative flex flex-col items-center text-center pt-24 pb-32">
          <CaveParticles count={15} duration={10} colors={['#FFD700', '#FFA500', '#B8860B']} />
          <motion.h1 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="treasure-title drop-shadow-xl mb-6 cave-enhanced-glow">
            كنوز المغارة
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="max-w-2xl text-lg text-gray-100 mb-10">
            استعد لرحلة فريدة بين أندر العروض والخصومات الأسطورية. جهّز عتادك وانطلق!
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }}>
            <button
              className="cave-enhanced-buy-button px-6 py-3 rounded-full text-base"
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
                caveAudio.playCoinCollect();
              }}
            >
              استكشف الأحداث
            </button>
          </motion.div>
        </section>

        <section id="events-section" className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="events">
            <div className="flex justify-center mb-6">
              <TabsList className="sticky top-0 bg-amber-50/20 border border-amber-500/20 shadow-sm z-10">
                <TabsTrigger value="events" className="text-white hover:opacity-80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                  الأحداث المتاحة
                </TabsTrigger>
                <TabsTrigger value="ticket" className="text-white hover:opacity-80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  استخدم تذكرة
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="events" className="transition-opacity data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-4 data-[state=active]:opacity-100 data-[state=active]:translate-y-0">
              {isLoadingEvents ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-400 mx-auto" />
                </div>
              ) : activeEvents && activeEvents.length > 0 ? (
                <div className="cave-grid">
                  {activeEvents.map(event => (
                    <motion.div
                      key={event.event_id}
                      className="cave-enhanced-card overflow-hidden"
                      {...caveAnimations.fadeInUp}
                    >
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

            <TabsContent value="ticket" className="transition-opacity data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-4 data-[state=active]:opacity-100 data-[state=active]:translate-y-0">
              <motion.div className="cave-enhanced-card max-w-xl mx-auto p-6 space-y-4" {...caveAnimations.fadeInUp}>
                <p className="text-center text-lg">أدخل رمز التذكرة للدخول إلى حدث خاص</p>
                <div className="flex items-stretch gap-4">
                  <Input value={ticketCode} onChange={e => setTicketCode(e.target.value)} placeholder="أدخل رمز التذكرة..." className="flex-grow bg-amber-50/10 border border-amber-600/30 text-center" />
                  <button className="cave-enhanced-buy-button px-6" onClick={handleValidateTicket} disabled={validateTicketMutation.isPending}>
                    {validateTicketMutation.isPending ? 'جاري التحقق...' : 'تحقق'}
                  </button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="my-16 border-t border-purple-500/10"></section>

        <section className="cave-grid md:grid-cols-3 gap-8 text-center">
          <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full">
            <div className="cave-enhanced-card-inner p-8">
              <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
              <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">كيف تعمل المغارة؟</h3>
              <p className="text-gray-700">المغارة هي مساحة خاصة تتيح لك الوصول إلى منتجات حصرية وعروض خاصة. يمكنك الدخول إليها من خلال الأحداث المجدولة أو باستخدام تذكرة.</p>
            </div>
          </motion.div>
          <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full" transition={{ delay: 0.1 }}>
            <div className="cave-enhanced-card-inner p-8">
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
              <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">الأحداث المجدولة</h3>
              <p className="text-gray-700">الأحداث المجدولة هي فترات زمنية محددة يمكن للجميع الدخول فيها إلى المغارة. تأكد من الالتزام بالوقت المحدد للاستفادة من العروض.</p>
            </div>
          </motion.div>
          <motion.div {...caveAnimations.fadeInUp} className="cave-enhanced-card h-full" transition={{ delay: 0.2 }}>
            <div className="cave-enhanced-card-inner p-8">
              <KeyRound className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
              <h3 className="cave-enhanced-title text-2xl font-extrabold mb-4">التذاكر الخاصة</h3>
              <p className="text-gray-700">التذاكر الخاصة تتيح لك الدخول إلى أحداث محددة. يمكنك الحصول عليها من خلال العروض الترويجية أو كمكافأة على مشترياتك.</p>
            </div>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>
        {isTicketDialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="cave-enhanced-card max-w-lg w-full relative">
              <div className="cave-enhanced-card-inner p-8">
                <button onClick={() => setIsTicketDialogOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
                  <X />
                </button>
                <Ticket className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float" />
                <h2 className="cave-enhanced-title text-2xl mb-4">تذكرة الدخول لحدث:</h2>
                <p className="cave-enhanced-price text-xl font-bold mb-6">{selectedEvent?.title}</p>
                <div className="flex items-stretch gap-4">
                  <input type="text" value={ticketCode} onChange={e => setTicketCode(e.target.value)} placeholder="أدخل رمز التذكرة..." className="flex-grow bg-amber-50/10 border border-amber-600/30 text-center placeholder-gray-500 rounded-lg px-6 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500" />
                  <button onClick={handleValidateTicket} disabled={validateTicketMutation.isPending} className="cave-enhanced-buy-button px-6 py-3 rounded-full">
                    {validateTicketMutation.isPending ? 'جاري التحقق...' : 'تأكيد'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CavePage;
