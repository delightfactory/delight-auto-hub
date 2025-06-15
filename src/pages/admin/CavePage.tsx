import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  FileX,
  Calendar,
  Ticket,
  Users,
  ShoppingBag,
  Clock,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Coins
} from 'lucide-react';
import { caveService } from '@/services/caveService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CaveEvent, CaveTicket, CaveSession, CaveOrder } from '@/types/db';
import CaveEventForm from '@/components/admin/CaveEventForm';
import CaveTicketForm from '@/components/admin/CaveTicketForm';

const CavePage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CaveEvent | null>(null);
  const [editingTicket, setEditingTicket] = useState<CaveTicket | null>(null);
  
  // استعلامات لجلب بيانات المغارة
  const {
    data: events = [],
    isLoading: loadingEvents,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['cave-events'],
    queryFn: caveService.getEvents
  });
  
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    refetch: refetchTickets
  } = useQuery({
    queryKey: ['cave-tickets'],
    queryFn: () => caveService.getTickets()
  });
  
  const {
    data: sessions = [],
    isLoading: loadingSessions,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ['cave-sessions'],
    queryFn: () => caveService.getSessions()
  });
  
  const {
    data: orders = [],
    isLoading: loadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['cave-orders'],
    queryFn: () => caveService.getOrders()
  });
  
  // إحصائيات المغارة
  const {
    data: stats,
    isLoading: loadingStats
  } = useQuery({
    queryKey: ['cave-stats'],
    queryFn: caveService.getCaveStats
  });
  
  // وظائف التعامل مع الأحداث
  const handleEditEvent = (event: CaveEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await caveService.deleteEvent(eventId);
      toast({
        title: "تم حذف الحدث",
        description: "تم حذف حدث المغارة بنجاح"
      });
      refetchEvents();
    } catch (error) {
      console.error("خطأ في حذف الحدث:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف الحدث",
        variant: "destructive"
      });
    }
  };
  
  const handleEventFormSubmit = async (eventData: Partial<CaveEvent>) => {
    try {
      if (editingEvent) {
        await caveService.updateEvent(editingEvent.event_id, eventData);
        toast({
          title: "تم تحديث الحدث",
          description: "تم تحديث بيانات حدث المغارة بنجاح"
        });
      } else {
        await caveService.createEvent(eventData);
        toast({
          title: "تم إضافة الحدث",
          description: "تم إضافة حدث المغارة الجديد بنجاح"
        });
      }
      setShowEventForm(false);
      setEditingEvent(null);
      refetchEvents();
    } catch (error) {
      console.error("خطأ في حفظ الحدث:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ الحدث",
        variant: "destructive"
      });
    }
  };
  
  // وظائف التعامل مع التذاكر
  const handleEditTicket = (ticket: CaveTicket) => {
    setEditingTicket(ticket);
    setShowTicketForm(true);
  };
  
  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await caveService.deleteTicket(ticketId);
      toast({
        title: "تم حذف التذكرة",
        description: "تم حذف تذكرة المغارة بنجاح"
      });
      refetchTickets();
    } catch (error) {
      console.error("خطأ في حذف التذكرة:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف التذكرة",
        variant: "destructive"
      });
    }
  };
  
  const handleTicketFormSubmit = async (ticketData: Partial<CaveTicket>) => {
    try {
      if (editingTicket) {
        await caveService.updateTicket(editingTicket.ticket_id, ticketData);
        toast({
          title: "تم تحديث التذكرة",
          description: "تم تحديث بيانات تذكرة المغارة بنجاح"
        });
      } else {
        await caveService.createTicket(ticketData);
        toast({
          title: "تم إضافة التذكرة",
          description: "تم إضافة تذكرة المغارة الجديدة بنجاح"
        });
      }
      setShowTicketForm(false);
      setEditingTicket(null);
      refetchTickets();
    } catch (error) {
      console.error("خطأ في حفظ التذكرة:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ التذكرة",
        variant: "destructive"
      });
    }
  };
  
  // تصفية البيانات بناءً على مصطلح البحث
  const filteredEvents = searchTerm
    ? events.filter((event: CaveEvent) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : events;
    
  const filteredTickets = searchTerm
    ? tickets.filter((ticket: CaveTicket) =>
        ticket.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tickets;
    
  const filteredSessions = searchTerm
    ? sessions.filter((session: CaveSession) =>
        session.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.event_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sessions;
    
  const filteredOrders = searchTerm
    ? orders.filter((order: CaveOrder) =>
        order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* عرض نموذج إضافة/تعديل الحدث */}
      {showEventForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {editingEvent ? 'تعديل حدث المغارة' : 'إضافة حدث مغارة جديد'}
            </h1>
            <Button variant="ghost" onClick={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}>
              العودة إلى قائمة الأحداث
            </Button>
          </div>
          <CaveEventForm 
            initialData={editingEvent} 
            onSubmit={handleEventFormSubmit}
            onCancel={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}
          />
        </div>
      ) : showTicketForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {editingTicket ? 'تعديل تذكرة المغارة' : 'إضافة تذكرة مغارة جديدة'}
            </h1>
            <Button variant="ghost" onClick={() => {
              setShowTicketForm(false);
              setEditingTicket(null);
            }}>
              العودة إلى قائمة التذاكر
            </Button>
          </div>
          <CaveTicketForm 
            initialData={editingTicket} 
            events={events}
            onSubmit={handleTicketFormSubmit}
            onCancel={() => {
              setShowTicketForm(false);
              setEditingTicket(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* رأس الصفحة مع عنوان وبحث وزر إضافة */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">نظام المغارة</h1>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث..."
                  className="pr-10 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeTab === 'events' && (
                <Button onClick={() => setShowEventForm(true)}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  <span>إضافة حدث</span>
                </Button>
              )}
              {activeTab === 'tickets' && (
                <Button onClick={() => setShowTicketForm(true)}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  <span>إضافة تذكرة</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* بطاقات الإحصائيات */}
          {!loadingStats && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الأحداث</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalEvents}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">{stats.activeEvents}</span> أحداث نشطة
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الجلسات</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalSessions}</h3>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">{stats.activeSessions}</span> جلسات نشطة
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الطلبات</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الإيرادات</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalRevenue} جنيه</h3>
                  </div>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* علامات التبويب */}
          <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>الأحداث</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span>التذاكر</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>الجلسات</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>الطلبات</span>
              </TabsTrigger>
            </TabsList>
            
            {/* محتوى علامة تبويب الأحداث */}
            <TabsContent value="events">
              {loadingEvents ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
                  <p className="text-lg font-medium">جارِ تحميل أحداث المغارة...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>تاريخ البدء</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الحد الأقصى للمستخدمين</TableHead>
                        <TableHead>وقت المستخدم (دقيقة)</TableHead>
                        <TableHead>حد الشراء</TableHead>
                        <TableHead>طرق الدفع</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event: CaveEvent) => (
                        <TableRow key={event.event_id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <Badge variant={event.kind === 'scheduled' ? 'default' : 'secondary'}>
                              {event.kind === 'scheduled' ? 'مجدول' : 'بالتذكرة'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(event.start_time)}</TableCell>
                          <TableCell>{formatDateTime(event.end_time)}</TableCell>
                          <TableCell>
                            <Badge variant={event.is_active ? 'success' : 'destructive'}>
                              {event.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{event.max_concurrent}</TableCell>
                          <TableCell className="text-center">{event.user_time_limit}</TableCell>
                          <TableCell className="text-center">{event.purchase_cap}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {event.allowed_pay === 'points' ? 'نقاط' : 
                               event.allowed_pay === 'cash' ? 'نقدي' : 'كلاهما'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد من حذف الحدث؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحدث نهائياً من قاعدة البيانات.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDeleteEvent(event.event_id)}
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {searchTerm ? "لا يوجد أحداث مطابقة" : "لا يوجد أحداث"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm
                      ? "لم نتمكن من العثور على أحداث تطابق عملية البحث"
                      : "لم يتم إضافة أي أحداث للمغارة بعد"}
                  </p>
                  <Button onClick={() => setShowEventForm(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    <span>إضافة حدث جديد</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* محتوى علامة تبويب التذاكر */}
            <TabsContent value="tickets">
              {loadingTickets ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
                  <p className="text-lg font-medium">جارِ تحميل تذاكر المغارة...</p>
                </div>
              ) : filteredTickets.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود التذكرة</TableHead>
                        <TableHead>الحدث</TableHead>
                        <TableHead>الحد الأقصى للاستخدام</TableHead>
                        <TableHead>حد المستخدم</TableHead>
                        <TableHead>شخصية</TableHead>
                        <TableHead>المالك</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket: CaveTicket) => {
                        const eventTitle = events.find(e => e.event_id === ticket.event_id)?.title || 'غير معروف';
                        return (
                          <TableRow key={ticket.ticket_id}>
                            <TableCell className="font-medium">{ticket.code}</TableCell>
                            <TableCell>{eventTitle}</TableCell>
                            <TableCell className="text-center">{ticket.max_use}</TableCell>
                            <TableCell className="text-center">{ticket.per_user_limit}</TableCell>
                            <TableCell>
                              <Badge variant={ticket.is_personal ? 'default' : 'secondary'}>
                                {ticket.is_personal ? 'نعم' : 'لا'}
                              </Badge>
                            </TableCell>
                            <TableCell>{ticket.owner_user || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={ticket.is_active ? 'success' : 'destructive'}>
                                {ticket.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell>{ticket.expiry ? formatDateTime(ticket.expiry) : '-'}</TableCell>
                            <TableCell>{formatDateTime(ticket.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTicket(ticket)}
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>هل أنت متأكد من حذف التذكرة؟</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        هذا الإجراء لا يمكن التراجع عنه. سيتم حذف التذكرة نهائياً من قاعدة البيانات.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDeleteTicket(ticket.ticket_id)}
                                      >
                                        حذف
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {searchTerm ? "لا يوجد تذاكر مطابقة" : "لا يوجد تذاكر"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm
                      ? "لم نتمكن من العثور على تذاكر تطابق عملية البحث"
                      : "لم يتم إضافة أي تذاكر للمغارة بعد"}
                  </p>
                  <Button onClick={() => setShowTicketForm(true)}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    <span>إضافة تذكرة جديدة</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* محتوى علامة تبويب الجلسات */}
            <TabsContent value="sessions">
              {loadingSessions ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
                  <p className="text-lg font-medium">جارِ تحميل جلسات المغارة...</p>
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الجلسة</TableHead>
                        <TableHead>الحدث</TableHead>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>وقت الدخول</TableHead>
                        <TableHead>وقت الانتهاء</TableHead>
                        <TableHead>وقت الخروج</TableHead>
                        <TableHead>إجمالي الإنفاق</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session: CaveSession) => {
                        const eventTitle = events.find(e => e.event_id === session.event_id)?.title || 'غير معروف';
                        const isActive = !session.left_at;
                        return (
                          <TableRow key={session.session_id}>
                            <TableCell className="font-medium">{session.session_id.substring(0, 8)}...</TableCell>
                            <TableCell>{eventTitle}</TableCell>
                            <TableCell>{session.user_id.substring(0, 8)}...</TableCell>
                            <TableCell>{formatDateTime(session.entered_at)}</TableCell>
                            <TableCell>{formatDateTime(session.expires_at)}</TableCell>
                            <TableCell>{session.left_at ? formatDateTime(session.left_at) : '-'}</TableCell>
                            <TableCell>{session.total_spent} جنيه</TableCell>
                            <TableCell>
                              <Badge variant={isActive ? 'success' : 'secondary'}>
                                {isActive ? 'نشطة' : 'منتهية'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {searchTerm ? "لا يوجد جلسات مطابقة" : "لا يوجد جلسات"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm
                      ? "لم نتمكن من العثور على جلسات تطابق عملية البحث"
                      : "لم يتم تسجيل أي جلسات للمغارة بعد"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* محتوى علامة تبويب الطلبات */}
            <TabsContent value="orders">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
                  <p className="text-lg font-medium">جارِ تحميل طلبات المغارة...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>الحدث</TableHead>
                        <TableHead>الجلسة</TableHead>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>طريقة الدفع</TableHead>
                        <TableHead>تاريخ الطلب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: CaveOrder) => {
                        const eventTitle = events.find(e => e.event_id === order.event_id)?.title || 'غير معروف';
                        return (
                          <TableRow key={order.order_id}>
                            <TableCell className="font-medium">{order.order_id.substring(0, 8)}...</TableCell>
                            <TableCell>{eventTitle}</TableCell>
                            <TableCell>{order.session_id.substring(0, 8)}...</TableCell>
                            <TableCell>{order.user_id.substring(0, 8)}...</TableCell>
                            <TableCell>{order.amount} جنيه</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {order.paid_with === 'points' ? 'نقاط' : 
                                 order.paid_with === 'cash' ? 'نقدي' : 'مختلط'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateTime(order.created_at)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {searchTerm ? "لا يوجد طلبات مطابقة" : "لا يوجد طلبات"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm
                      ? "لم نتمكن من العثور على طلبات تطابق عملية البحث"
                      : "لم يتم تسجيل أي طلبات للمغارة بعد"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CavePage;