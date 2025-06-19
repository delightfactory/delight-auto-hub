import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, Timer, Ticket, AlertCircle, Gem, LogIn, LogOut, X, HelpCircle, Zap, KeyRound, ArrowDown } from 'lucide-react';
import { useCaveAudio } from '../components/cave/CaveAudioEffects';
import CaveParticles from '../components/cave/CaveParticles';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';


import { motion, AnimatePresence } from 'framer-motion';
import CaveCountdown from '../components/cave/CaveCountdown';


// Hooks & services
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { caveService } from '@/services/caveService';
import type { CaveEvent } from '@/types/db';

/* Legacy mock data block (disabled)





    { event_id: 'event_scheduled_1', title: 'مهرجان الكنوز الصيفي', kind: 'scheduled', start_time: new Date().toISOString(), end_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), max_concurrent: 100, user_time_limit: 60 },
    { event_id: 'event_ticket_1', title: 'الدخول الحصري للتذكرة الذهبية', kind: 'ticket', start_time: new Date().toISOString(), end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), max_concurrent: 50, user_time_limit: 120 },

, user_id: 'user_mock_123', event_id: 'event_1', entered_at: new Date(Date.now() - 15 * 60000).toISOString(), expires_at: new Date(Date.now() + 45 * 60000).toISOString(), total_spent: 0 };
 {
    getActiveEvents: async () => { await new Promise(res => setTimeout(res, 800)); return mockEvents; },
    getActiveUserSession: async (userId: string) => { await new Promise(res => setTimeout(res, 800)); return null; },
    validateTicket: async (code: string, userId: string) => {
        await new Promise(res => setTimeout(res, 500));
        if (code.toUpperCase() === 'VALID123') return { valid: true, event: mockEvents.find(e => e.kind === 'ticket') };
        return { valid: false, message: 'رمز التذكرة غير صحيح أو منتهي الصلاحية.' };
    },
    createSession: async (session: any) => { await new Promise(res => setTimeout(res, 500)); return { ...session, ...mockActiveSession }; },
    endSession: async (sessionId: string, totalSpent: number) => { await new Promise(res => setTimeout(res, 500)); return { success: true }; },
};



*/

const CavePage: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const caveAudio = useCaveAudio();
    
    const [ticketCode, setTicketCode] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<CaveEvent | null>(null);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('events');

    // جلب الأحداث النشطة
    const { data: activeEvents, isLoading: isLoadingEvents } = useQuery({
        queryKey: ['cave-active-events'],
        queryFn: caveService.getActiveEvents,
    });

    // جلب الجلسة النشطة للمستخدم الحالي (إن وجدت)
    const { data: activeSession, isLoading: isLoadingSession, refetch: refetchSession } = useQuery({
        queryKey: ['cave-active-session', user?.id],
        queryFn: () => user?.id ? caveService.getActiveUserSession(user.id) : Promise.resolve(null),
        enabled: !!user?.id,
    });

    // جلب معلومات الحدث للجلسة النشطة
    const { data: activeEventDetails } = useQuery({
        queryKey: ['cave-event', activeSession?.event_id],
        queryFn: () => activeSession ? caveService.getEventById(activeSession.event_id) : Promise.resolve(null),
        enabled: !!activeSession?.event_id,
    });





    // إنشاء جلسة جديدة
    // جلب جميع جلسات المستخدم لحساب مشاركاته لكل حدث
    const { data: userSessions = [] } = useQuery({
        queryKey: ['cave-user-sessions', user?.id],
        queryFn: () => user ? caveService.getSessions(undefined, user.id) : Promise.resolve([]),
        enabled: !!user?.id,
    });
    const createSessionMutation = useMutation({
        mutationFn: (eventId: string) => {
            if (!user?.id) throw new Error('يجب تسجيل الدخول أولاً');
            return caveService.createSession({ userId: user.id, eventId });
        },
        onSuccess: (newSession) => {
            toast({ title: 'تم الدخول بنجاح!', description: 'جاري نقلك إلى صفحة الكنوز...', variant: 'default' });
            queryClient.invalidateQueries({ queryKey: ['cave-active-session'] });
            caveAudio.playCaveDoor();
            navigate(`/cave/products/${newSession.session_id}`);
        },
        onError: (error: any) => {
            toast({ title: 'خطأ في الدخول إلى المغارة', description: error.message || 'حدث خطأ أثناء محاولة الدخول.', variant: 'destructive' });
        },
    });

    // التحقق من صلاحية التذكرة
    const validateTicketMutation = useMutation({
        mutationFn: (code: string) => caveService.validateTicket(code, user?.id || ''),
        onSuccess: (data: any) => {
            if (data.valid) {
                toast({
                    title: 'تم التحقق من التذكرة بنجاح',
                    description: 'جاري الدخول إلى المغارة...',
                    variant: 'default',
                });
                caveAudio.playTreasureFound();
                setIsTicketDialogOpen(false);
                // **الوظيفة الأصلية: الدخول مباشرة بعد التحقق**
                if (data.event) {
                    // سيقوم هذا الآن بالدخول ثم التوجيه تلقائيًا بفضل الإصلاح أعلاه
                    createSessionMutation.mutate(data.event.event_id);
                }
            } else {
                toast({
                    title: 'التذكرة غير صالحة',
                    description: data.message || 'يرجى التحقق من الرمز والمحاولة مرة أخرى',
                    variant: 'destructive',
                });
            }
        },
        onError: (error: any) => {
            toast({
                title: 'خطأ في التحقق من التذكرة',
                description: 'حدث خطأ أثناء التحقق من التذكرة. يرجى المحاولة مرة أخرى.',
                variant: 'destructive',
            });
        },
    });

    // إنهاء الجلسة الحالية
    const endSessionMutation = useMutation({
        mutationFn: () => {
            if (!activeSession?.session_id) throw new Error('لا توجد جلسة نشطة');
            return caveService.endSession(activeSession.session_id, activeSession.total_spent);
        },
        onSuccess: () => {
            toast({ title: 'تم الخروج من المغارة بنجاح', description: 'نأمل أن تكون قد استمتعت بوقتك!', variant: 'default' });
            queryClient.invalidateQueries({ queryKey: ['cave-active-session'] });
            refetchSession();
        },
        onError: (error: any) => {
            toast({ title: 'خطأ في الخروج من المغارة', description: error.message || 'حدث خطأ أثناء محاولة الخروج.', variant: 'destructive' });
        },
    });

    // التحقق من صلاحية التذكرة
    const handleValidateTicket = () => {
        const trimmedCode = ticketCode.trim();
        if (!trimmedCode) {
            toast({ title: 'الرجاء إدخال رمز التذكرة', variant: 'destructive' });
            return;
        }
        if (!user) {
            toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
            navigate('/auth');
            return;
        }
        validateTicketMutation.mutate(trimmedCode);
    };

    const handleEnterCave = (eventId: string) => {
        if (!user) {
            toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
            navigate('/auth');
            return;
        }
        // إذا كانت هناك جلسة نشطة، تعامل بناءً على الحدث
        if (activeSession) {
            if (activeSession.event_id === eventId) {
                caveAudio.playCaveDoor();
                navigate(`/cave/products/${activeSession.session_id}`);
            } else {
                toast({ title: 'لديك جلسة نشطة في حدث آخر', description: `الحدث الحالي: ${activeEventDetails?.title}`, variant: 'warning' });
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
                <p className="mt-4 text-xl tracking-wider">جاري استكشاف المغارة...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen cave-enhanced-bg text-white font-cairo" dir="rtl">
          {activeSession && (
            <div className="cave-enhanced-header mb-6 mx-auto max-w-4xl">
              <div className="cave-enhanced-header-container">
                <div className="cave-enhanced-header-section">
                  <div className="cave-enhanced-icon cave-enhanced-icon-hourglass"></div>
                  <span className="text-sm font-bold">جلسة نشطة</span>
                </div>
                <div className="cave-enhanced-header-section">
                  {activeEventDetails && <span className="text-sm">{activeEventDetails.title}</span>}
                </div>
                <div className="cave-enhanced-timer-display">
                  <div className="cave-enhanced-icon cave-enhanced-icon-hourglass"></div>
                  <span className="text-xs">تنتهي: {formatDateTime(activeSession.expires_at)}</span>
                </div>
              </div>
              <div className="cave-enhanced-progress-container">
                <div className="cave-enhanced-progress-bar" style={{ width: '50%' }}></div>
              </div>
              <div className="mt-2 flex gap-2 justify-center">
                <button 
                  className="cave-enhanced-buy-button"
                  onClick={() => navigate(`/cave/products/${activeSession.session_id}`)}
                >
                  <LogIn className="mr-1 h-4 w-4"/> الدخول إلى الكنوز
                </button>
                <button 
                  className="cave-enhanced-buy-button bg-red-600 hover:bg-red-700"
                  onClick={handleExitCave}
                >
                  <LogOut className="mr-1 h-4 w-4"/> خروج من المغارة
                </button>
              </div>
            </div>
          )}
            <div className="cave-enhanced-bg" aria-hidden="true"></div>
            <div className="container mx-auto px-4 py-12 relative">
                {/* قسم البطل */}
                <div className="relative flex flex-col items-center text-center pt-24 pb-32">
                    <CaveParticles count={15} duration={10} colors={['#FFD700', '#FFA500', '#B8860B']} />
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="treasure-title drop-shadow-xl mb-6 cave-enhanced-glow"
                    >
                        كنوز المغارة
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="max-w-2xl text-lg text-gray-100 mb-10"
                    >
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
                            <Gem className="mr-1 h-4 w-4" />
                            استكشف الأحداث
                        </button>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {activeSession ? (
                        <motion.div key="active-session" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>

                            <div className="cave-enhanced-card max-w-2xl mx-auto">
                                <div className="cave-enhanced-card-inner">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="p-3 bg-green-500/20 rounded-full">
                                                <Gem className="w-8 h-8 text-green-400 cave-enhanced-float"/>
                                            </div>
                                        </div>
                                        <h2 className="cave-enhanced-title text-3xl font-bold">أهلاً بك في الداخل!</h2>
                                        <p className="text-gray-700 mb-2 text-sm">دخلت في: {formatDateTime(activeSession.entered_at)}</p>
                                        <p className="text-gray-700 text-sm">استمتع بالتسوق قبل انتهاء الوقت.</p>
                                    </div>
                                    <div className="text-lg font-semibold bg-gray-800/20 p-4 rounded-lg text-center mt-4 text-amber-800">
                                        تنتهي الجلسة في: {formatDateTime(activeSession.expires_at)}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
                                        <button 
                                            className="cave-enhanced-buy-button flex-1"
                                            onClick={() => {
                                                navigate(`/cave/products/${activeSession.session_id}`);
                                                caveAudio.playCaveDoor();
                                            }}
                                        >
                                            <LogIn className="mr-1 h-4 w-4"/> اذهب للتسوق
                                        </button>
                                        <button 
                                            className="cave-enhanced-buy-button flex-1 bg-red-600 hover:bg-red-700"
                                            onClick={handleExitCave} 
                                            disabled={endSessionMutation.isPending}
                                        >
                                            {endSessionMutation.isPending ? 'جاري الخروج...' : <><LogOut className="mr-1 h-4 w-4"/> إنهاء الجلسة</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="no-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div id="events-section" className="max-w-4xl mx-auto">
                                <Tabs defaultValue="events" value={activeTab} onValueChange={(value) => {
                                    setActiveTab(value);
                                    caveAudio.playCoinCollect();
                                }}>
                                    <div className="flex justify-center mb-6">
                                        <TabsList className="sticky top-0 bg-amber-50/20 border border-amber-500/20 shadow-sm z-10">
                                            <TabsTrigger 
                                                value="events" 
                                                className="text-white hover:opacity-80 transition-opacity data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
                                            >
                                                الأحداث المتاحة
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="ticket" 
                                                className="text-white hover:opacity-80 transition-opacity data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                                            >
                                                استخدم تذكرة
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    
                                    <TabsContent value="events" className="px-2 sm:px-6 pb-4 transition-opacity transform duration-500 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-4 data-[state=active]:opacity-100 data-[state=active]:translate-y-0">
  
                                        {isLoadingEvents ? (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-400 mx-auto"></div>
                                            </div>
                                        ) : activeEvents && activeEvents.length > 0 ? (
                                            <div className="cave-events-container">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {activeEvents.map(event => (
                                                            <div key={event.event_id} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 cave-event-card">
                                                                <div className="bg-amber-50/90 p-6 rounded-lg shadow-md space-y-4">
                                                                    <div>
                                                                        <h3 className="cave-enhanced-title text-xl sm:text-2xl md:text-3xl font-extrabold">
                                                                            {event.title}
                                                                        </h3>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        <div className="flex items-center">
                                                                            <div className="bg-amber-100 p-1 rounded-full ml-2"><Calendar className="w-4 h-4 text-purple-400"/></div> 
                                                                            <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200"><Calendar className="w-4 h-4 text-purple-400" aria-hidden="true"/> هيبتدي: {formatDateTime(event.start_time)}</Badge>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <div className="bg-amber-100 p-1 rounded-full ml-2"><Clock className="w-4 h-4 text-purple-400"/></div> 
                                                                            <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200"><Clock className="w-4 h-4 text-purple-400" aria-hidden="true"/> هيخلص: {formatDateTime(event.end_time)}</Badge>
                                                                        </div>
                                                                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                                                            
                                                                            <CaveCountdown 
                                                                                endTime={event.end_time} 
                                                                                className="font-bold"
                                                                                showLabel={false}
                                                                            />
                                                                            فاضلك
                                                                        </Badge>
                                                                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                                                            <Users className="w-4 h-4 text-purple-400" aria-hidden="true"/> 
                                                                            أقصى مستخدمين: {event.max_concurrent}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                                                            <Timer className="w-4 h-4 text-purple-400" aria-hidden="true"/> 
                                                                            مدتها: {event.user_time_limit} دقيقة
                                                                        </Badge>
                                                                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                                                            <Zap className="w-4 h-4 text-purple-400" aria-hidden="true"/> 
                                                                            محاولاتك: {userSessions.filter(s => s.event_id === event.event_id).length}/{event.max_participations_per_user}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4 border-t border-amber-500/10 pt-4">
                                                                        {activeSession ? (
                                                                            activeSession.event_id === event.event_id ? (
                                                                                <>
                                                                                    <button 
                                                                                        className="cave-enhanced-buy-button flex-1"
                                                                                        onClick={() => {
                                                                                            navigate(`/cave/products/${activeSession.session_id}`);
                                                                                            caveAudio.playCaveDoor();
                                                                                        }}
                                                                                    >
                                                                                        <LogIn className="mr-1 h-4 w-4"/> الدخول إلى الكنوز
                                                                                    </button>
                                                                                    <button 
                                                                                        className="cave-enhanced-buy-button flex-1 bg-red-600 hover:bg-red-700"
                                                                                        onClick={handleExitCave} 
                                                                                        disabled={endSessionMutation.isPending}
                                                                                    >
                                                                                        {endSessionMutation.isPending ? 'جاري الخروج...' : <><LogOut className="mr-1 h-4 w-4"/> إنهاء الجلسة</>}
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button className="cave-enhanced-buy-button flex-1 opacity-50" disabled>لا يمكنك بدء جلسة جديدة في حدث آخر</button>
                                                                            )
                                                                        ) : event.kind === 'ticketed' ? (
                                                                            <button 
                                                                                className="cave-enhanced-buy-button bg-purple-600 hover:bg-purple-700"
                                                                                onClick={() => {
                                                                                    setSelectedEvent(event);
                                                                                    setIsTicketDialogOpen(true);
                                                                                    caveAudio.playCoinCollect();
                                                                                }}
                                                                            >
                                                                                <Ticket className="mr-1 h-4 w-4"/>استخدم تذكرة
                                                                            </button>
                                                                        ) : (
                                                                            <button 
                                                                                className="cave-enhanced-buy-button"
                                                                                onClick={() => {
                                                                                    handleEnterCave(event.event_id);
                                                                                    caveAudio.playCaveDoor();
                                                                                }}
                                                                                disabled={createSessionMutation.isPending || (userSessions.filter(s => s.event_id === event.event_id).length >= event.max_participations_per_user)}
                                                                            >
                                                                                {createSessionMutation.isPending ? 'جاري الدخول...' : <><LogIn className="mr-1 h-4 w-4"/>دخول</>}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 bg-white p-6 rounded-lg shadow-lg space-y-4">
                                                    <AlertCircle className="h-16 w-16 text-purple-400"/>
                                                    <h3 className="cave-enhanced-title text-2xl text-gray-700">لا توجد أحداث متاحة حالياً</h3>
                                                    <p className="text-gray-500">نعتذر ولكن لا توجد أحداث في الوقت الحالي. يرجى العودة لاحقاً.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                        
                                        <TabsContent value="ticket" className="px-2 sm:px-6 pb-4 transition-opacity transform duration-500 ease-in-out data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-4 data-[state=active]:opacity-100 data-[state=active]:translate-y-0">
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md text-center"
                                            >
                                                <Ticket className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float"/>
                                                <h3 className="cave-enhanced-title text-2xl mb-2">هل لديك تذكرة؟</h3>
                                                <p className="text-gray-700 mb-6">أدخل الرمز الخاص بك هنا للدخول إلى المغارة مباشرة.</p>
                                                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                                    <Input 
                                                        type="text" 
                                                        value={ticketCode} 
                                                        onChange={e => setTicketCode(e.target.value)} 
                                                        placeholder="أدخل رمز التذكرة..." 
                                                        className="flex-grow bg-amber-50/10 border border-amber-600/30 text-center placeholder-gray-500 rounded-lg px-6 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500 transition-all"
                                                    />
                                                    <button 
                                                        className="cave-enhanced-buy-button px-6 py-3 rounded-full text-base"
                                                        onClick={handleValidateTicket} 
                                                        disabled={validateTicketMutation.isPending}
                                                    >
                                                        {validateTicketMutation.isPending ? 'جاري التحقق...' : 'تحقق'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </TabsContent>
                                    </Tabs>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                 <AnimatePresence>
                    {isTicketDialogOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="cave-enhanced-card max-w-lg w-full relative">
                                <div className="cave-enhanced-card-inner p-8">
                                    <button onClick={() => setIsTicketDialogOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800"><X/></button>
                                        <Ticket className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float"/>
                                        <h2 className="cave-enhanced-title text-2xl mb-4">تذكرة الدخول لحدث:</h2>
                                        <p className="cave-enhanced-price text-xl font-bold mb-6">{selectedEvent?.title}</p>
                                        <div className="flex items-stretch gap-4">
                                            <input type="text" value={ticketCode} onChange={e => setTicketCode(e.target.value)} placeholder="أدخل رمز التذكرة..." className="flex-grow bg-amber-50/10 border border-amber-600/30 text-center placeholder-gray-500 rounded-lg px-6 py-3 focus:outline-none focus:ring-4 focus:ring-amber-500 transition-all"/>
                                            <button onClick={handleValidateTicket} disabled={validateTicketMutation.isPending} className="cave-enhanced-buy-button px-6 py-3 rounded-full">
                                                {validateTicketMutation.isPending ? "جاري التحقق..." : "تأكيد"}
                                            </button>
                                        </div>
                                    </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="my-16 border-t border-purple-500/10"></div>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                     <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.1, duration:0.5}} viewport={{ once: true }}>
                        <div className="cave-enhanced-card h-full transform hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                            <div className="cave-enhanced-card-inner p-8">
                                <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float"/>
                                <h3 className="cave-enhanced-title text-2xl md:text-3xl font-extrabold mb-4">كيف تعمل المغارة؟</h3>
                                <p className="text-gray-700">المغارة هي مساحة خاصة تتيح لك الوصول إلى منتجات حصرية وعروض خاصة. يمكنك الدخول إليها من خلال الأحداث المجدولة أو باستخدام تذكرة خاصة.</p>
                            </div>
                        </div>
                    </motion.div>
                     <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.2, duration:0.5}} viewport={{ once: true }}>
                        <div className="cave-enhanced-card h-full transform hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                            <div className="cave-enhanced-card-inner p-8">
                                <Zap className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float"/>
                                <h3 className="cave-enhanced-title text-2xl md:text-3xl font-extrabold mb-4">الأحداث المجدولة</h3>
                                <p className="text-gray-700">الأحداث المجدولة هي فترات زمنية محددة يمكن للجميع الدخول فيها إلى المغارة. تأكد من الالتزام بالوقت المحدد للاستفادة من العروض.</p>
                            </div>
                        </div>
                    </motion.div>
                     <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.3, duration:0.5}} viewport={{ once: true }}>
                        <div className="cave-enhanced-card h-full transform hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                            <div className="cave-enhanced-card-inner p-8">
                                <KeyRound className="w-16 h-16 text-purple-400 mx-auto mb-6 cave-enhanced-float"/>
                                <h3 className="cave-enhanced-title text-2xl md:text-3xl font-extrabold mb-4">التذاكر الخاصة</h3>
                                <p className="text-gray-700">التذاكر الخاصة تتيح لك الدخول إلى أحداث محددة. يمكنك الحصول عليها من خلال العروض الترويجية أو كمكافأة على مشترياتك.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default CavePage;
