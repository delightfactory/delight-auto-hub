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
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white font-cairo">
                <Gem className="w-16 h-16 text-purple-400 animate-pulse" />
                <p className="mt-4 text-xl tracking-wider">جاري استكشاف المغارة...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-cairo" dir="rtl">
          {activeSession && (
            <div className="mb-6 p-4 bg-yellow-800/20 border-l-4 border-yellow-500 text-yellow-100 rounded-lg">
              <h2 className="font-bold text-lg">لديك جلسة نشطة</h2>
              {activeEventDetails && <p>الحدث: {activeEventDetails.title}</p>}
              <p>تنتهي عند: {formatDateTime(activeSession.expires_at)}</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => navigate(`/cave/products/${activeSession.session_id}`)}>الدخول إلى الكنوز</Button>
                <Button variant="destructive" onClick={handleExitCave}>خروج من المغارة</Button>
              </div>
            </div>
          )}
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
                .cave-gradient-text { background: linear-gradient(to right, #a78bfa, #c4b5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .themed-card { background-color: rgba(31, 41, 55, 0.4); border: 1px solid rgba(167, 139, 250, 0.2); backdrop-filter: blur(10px); transition: all 0.3s ease; }
                .themed-card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(167, 139, 250, 0.1); border-color: rgba(167, 139, 250, 0.4); }

                /* خلفية متدرجة متحركة */
                .cave-bg { position: fixed; inset: 0; z-index: -10; background: radial-gradient(circle at 50% 100%, rgba(255,215,0,0.05) 0%, transparent 60%), linear-gradient(135deg,#1e1b4b 0%, #2e1065 50%, #0f172a 100%); overflow:hidden; }
                .cave-bg::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E"); opacity:0.15; animation:bgMove 60s linear infinite; }
                @keyframes bgMove { from{transform:translateY(0)} to{transform:translateY(-100%)} }

                /* عنوان ديناميكي */
                .treasure-title { font-size: 3rem; background: linear-gradient(90deg,#facc15,#eab308,#a855f7,#9333ea); background-size:400% 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:gradientShift 8s ease infinite; }
                @keyframes gradientShift {0%{background-position:0%}100%{background-position:100%}}
             `}</style>
            <div className="cave-bg" aria-hidden="true"></div>
            <div className="container mx-auto px-4 py-12 relative">
                {/* قسم البطل */}
                <div className="relative flex flex-col items-center text-center pt-24 pb-32">
                    <CaveParticles count={15} duration={10} colors={['#FFD700', '#FFA500', '#B8860B']} />
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="treasure-title drop-shadow-xl mb-6"
                    >
                        كنوز المغارة
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="max-w-2xl text-lg text-gray-300 mb-10"
                    >
                        استعد لرحلة فريدة بين أندر العروض والخصومات الأسطورية. جهّز عتادك وانطلق!
                    </motion.p>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Button 
                            variant="default" 
                            size="lg"
                            className="px-4 py-2 rounded-md text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium shadow-md"
                            onClick={() => {
                                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
                                caveAudio.playCoinCollect();
                            }}
                        >
                            <Gem className="mr-1 h-4 w-4" />
                            استكشف الأحداث
                        </Button>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {activeSession ? (
                        <motion.div key="active-session" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>

                            <Card className="max-w-2xl mx-auto bg-gradient-to-b from-gray-800/80 to-gray-900/80 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-green-500/20 rounded-full">
                                            <Gem className="w-8 h-8 text-green-400"/>
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold">أهلاً بك في الداخل!</CardTitle>
                                    <CardDescription>
                                        <p className="text-gray-400 mb-2">دخلت في: {formatDateTime(activeSession.entered_at)}</p>
                                        <p className="text-gray-300">استمتع بالتسوق قبل انتهاء الوقت.</p>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-semibold bg-gray-800/60 p-4 rounded-lg text-center">
                                        تنتهي الجلسة في: {formatDateTime(activeSession.expires_at)}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row gap-4">
                                    <Button 
                                        variant="default" 
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/20"
                                        onClick={() => {
                                            navigate(`/cave/products/${activeSession.session_id}`);
                                            caveAudio.playCaveDoor();
                                        }}
                                    >
                                        <LogIn className="mr-1 h-4 w-4"/> اذهب للتسوق
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={handleExitCave} 
                                        disabled={endSessionMutation.isPending}
                                    >
                                        {endSessionMutation.isPending ? 'جاري الخروج...' : <><LogOut className="mr-1 h-4 w-4"/> إنهاء الجلسة</>}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div key="no-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Card id="events-section" className="max-w-4xl mx-auto bg-gradient-to-b from-gray-800/80 to-gray-900/80 border border-purple-500/20 shadow-xl shadow-purple-500/5">
                                <CardContent className="p-2 sm:p-4">
                                    <Tabs defaultValue="events" value={activeTab} onValueChange={(value) => {
                                        setActiveTab(value);
                                        caveAudio.playCoinCollect();
                                    }}>
                                        <div className="flex justify-center mb-6">
                                            <TabsList className="bg-gray-800/70 border border-purple-500/20">
                                                <TabsTrigger 
                                                    value="events" 
                                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
                                                >
                                                    الأحداث المتاحة
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="ticket" 
                                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                                                >
                                                    استخدم تذكرة
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>
                                        
                                        <TabsContent value="events" className="px-2 sm:px-6 pb-4">
                                            {isLoadingEvents ? (
                                                <div className="text-center py-12">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-400 mx-auto"></div>
                                                </div>
                                            ) : activeEvents && activeEvents.length > 0 ? (
                                                <ScrollArea className="h-[500px] pr-4">
                                                    <div className="grid gap-6 md:grid-cols-2">
                                                        {activeEvents.map(event => (
                                                            <Card key={event.event_id} className="bg-gradient-to-b from-gray-800/60 to-gray-900/60 border border-amber-500/20 shadow-lg shadow-amber-500/5 overflow-hidden">
                                                                <CardHeader>
                                                                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                                                                        {event.title}
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="space-y-3 text-gray-300 text-sm">
                                                                    <div className="flex items-center">
                                                                        <Calendar className="w-4 h-4 ml-2 text-purple-400"/> 
                                                                        <span>يبدأ: {formatDateTime(event.start_time)}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Clock className="w-4 h-4 ml-2 text-purple-400"/> 
                                                                        <span>ينتهي: {formatDateTime(event.end_time)}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Users className="w-4 h-4 ml-2 text-purple-400"/> 
                                                                        <span>الحد الأقصى: {event.max_concurrent} مستخدم</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Timer className="w-4 h-4 ml-2 text-purple-400"/> 
                                                                        <span>مدة الجلسة: {event.user_time_limit} دقيقة</span>
                                                                    </div>
                                                                </CardContent>
                                                                <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end bg-gray-800/30 border-t border-amber-500/10 py-4">
                                                                    {activeSession ? (
                                                                        activeSession.event_id === event.event_id ? (
                                                                            <>
                                                                                <Button 
                                                                                    variant="default" 
                                                                                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/20"
                                                                                    onClick={() => {
                                                                                        navigate(`/cave/products/${activeSession.session_id}`);
                                                                                        caveAudio.playCaveDoor();
                                                                                    }}
                                                                                >
                                                                                    <LogIn className="mr-1 h-4 w-4"/> الدخول إلى الكنوز
                                                                                </Button>
                                                                                <Button 
                                                                                    variant="destructive" 
                                                                                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                                                    onClick={handleExitCave} 
                                                                                    disabled={endSessionMutation.isPending}
                                                                                >
                                                                                    {endSessionMutation.isPending ? 'جاري الخروج...' : <><LogOut className="mr-1 h-4 w-4"/> إنهاء الجلسة</>}
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            <Button variant="outline" className="flex-1" disabled>لا يمكنك بدء جلسة جديدة في حدث آخر</Button>
                                                                        )
                                                                    ) : event.kind === 'ticketed' ? (
                                                                        <Button 
                                                                            variant="outline" 
                                                                            className="px-3 py-1 rounded-md text-sm border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 font-medium"
                                                                            onClick={() => {
                                                                                setSelectedEvent(event);
                                                                                setIsTicketDialogOpen(true);
                                                                                caveAudio.playCoinCollect();
                                                                            }}
                                                                        >
                                                                            <Ticket className="mr-1 h-4 w-4"/>استخدم تذكرة
                                                                        </Button>
                                                                    ) : (
                                                                        <Button 
                                                                            variant="default" 
                                                                            className="px-3 py-1 rounded-md text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium shadow-sm"
                                                                            onClick={() => {
                                                                                handleEnterCave(event.event_id);
                                                                                caveAudio.playCaveDoor();
                                                                            }}
                                                                            disabled={createSessionMutation.isPending}
                                                                        >
                                                                            {createSessionMutation.isPending ? 'جاري الدخول...' : <><LogIn className="mr-1 h-4 w-4"/>دخول</>}
                                                                        </Button>
                                                                    )}
                                                                </CardFooter>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            ) : (
                                                <Card className="bg-gray-800/50 border border-gray-700 text-center py-12">
                                                    <CardContent className="flex flex-col items-center">
                                                        <AlertCircle className="h-12 w-12 mb-4 text-gray-400"/>
                                                        <h3 className="text-xl font-medium text-gray-400">لا توجد أحداث متاحة حالياً</h3>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>
                                        
                                        <TabsContent value="ticket" className="px-2 sm:px-6 pb-4">
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="max-w-xl mx-auto text-center py-8"
                                            >
                                                <Ticket className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
                                                <h3 className="text-2xl font-bold mb-2">هل لديك تذكرة؟</h3>
                                                <p className="text-gray-400 mb-6">أدخل الرمز الخاص بك هنا للدخول إلى المغارة مباشرة.</p>
                                                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                                    <Input 
                                                        type="text" 
                                                        value={ticketCode} 
                                                        onChange={e => setTicketCode(e.target.value)} 
                                                        placeholder="أدخل رمز التذكرة..." 
                                                        className="flex-grow bg-gray-800/70 border border-purple-500/30 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    />
                                                    <Button 
                                                        variant="default" 
                                                        className="px-4 py-2 rounded-md text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium shadow-md"
                                                        onClick={handleValidateTicket} 
                                                        disabled={validateTicketMutation.isPending}
                                                    >
                                                        {validateTicketMutation.isPending ? 'جاري التحقق...' : 'تحقق'}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                 <AnimatePresence>
                    {isTicketDialogOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="themed-card rounded-2xl p-8 max-w-lg w-full relative">
                                <button onClick={() => setIsTicketDialogOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-white"><X/></button>
                                <div className="text-center">
                                    <Ticket className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
                                    <h2 className="text-2xl font-bold mb-2">تذكرة الدخول لحدث:</h2>
                                    <p className="cave-gradient-text text-xl font-bold mb-6">{selectedEvent?.title}</p>
                                    <div className="flex items-stretch gap-3">
                                        <input type="text" value={ticketCode} onChange={e => setTicketCode(e.target.value)} placeholder="أدخل رمز التذكرة..." className="flex-grow bg-gray-800/70 border border-purple-500/30 rounded-lg px-4 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"/>
                                        <button onClick={handleValidateTicket} disabled={validateTicketMutation.isPending} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors duration-300">
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
                        <div className="themed-card p-8 rounded-2xl h-full">
                            <HelpCircle className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
                            <h3 className="text-xl font-bold mb-2">كيف تعمل المغارة؟</h3>
                            <p className="text-gray-400">المغارة هي مساحة خاصة تتيح لك الوصول إلى منتجات حصرية وعروض خاصة. يمكنك الدخول إليها من خلال الأحداث المجدولة أو باستخدام تذكرة خاصة.</p>
                        </div>
                    </motion.div>
                     <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.2, duration:0.5}} viewport={{ once: true }}>
                        <div className="themed-card p-8 rounded-2xl h-full">
                            <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
                            <h3 className="text-xl font-bold mb-2">الأحداث المجدولة</h3>
                            <p className="text-gray-400">الأحداث المجدولة هي فترات زمنية محددة يمكن للجميع الدخول فيها إلى المغارة. تأكد من الالتزام بالوقت المحدد للاستفادة من العروض.</p>
                        </div>
                    </motion.div>
                     <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.3, duration:0.5}} viewport={{ once: true }}>
                        <div className="themed-card p-8 rounded-2xl h-full">
                            <KeyRound className="w-12 h-12 text-purple-400 mx-auto mb-4"/>
                            <h3 className="text-xl font-bold mb-2">التذاكر الخاصة</h3>
                            <p className="text-gray-400">التذاكر الخاصة تتيح لك الدخول إلى أحداث محددة. يمكنك الحصول عليها من خلال العروض الترويجية أو كمكافأة على مشترياتك.</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default CavePage;
