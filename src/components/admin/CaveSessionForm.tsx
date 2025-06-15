import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { caveService } from '@/services/caveService';
import { CaveSession } from '@/types/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// تعريف مخطط التحقق من صحة النموذج
const sessionFormSchema = z.object({
  event_id: z.string({
    required_error: 'يرجى اختيار الحدث',
  }),
  user_id: z.string({
    required_error: 'يرجى إدخال معرف المستخدم',
  }),
  entered_at: z.date({
    required_error: 'يرجى تحديد وقت الدخول',
  }),
  expires_at: z.date({
    required_error: 'يرجى تحديد وقت انتهاء الجلسة',
  }),
  left_at: z.date().optional(),
  total_spent: z.number().min(0, 'يجب أن يكون المبلغ 0 أو أكثر').default(0),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface CaveSessionFormProps {
  session?: CaveSession;
  onSubmit: (data: SessionFormValues) => void;
  onCancel: () => void;
}

const CaveSessionForm: React.FC<CaveSessionFormProps> = ({ session, onSubmit, onCancel }) => {
  // جلب قائمة الأحداث
  const { data: events } = useQuery({
    queryKey: ['cave-events'],
    queryFn: caveService.getEvents,
  });

  // إعداد نموذج React Hook Form
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      event_id: '',
      user_id: '',
      entered_at: new Date(),
      expires_at: new Date(Date.now() + 3600000), // ساعة واحدة افتراضياً
      total_spent: 0,
    },
  });

  // تحديث قيم النموذج عند تغيير الجلسة
  useEffect(() => {
    if (session) {
      form.reset({
        event_id: session.event_id,
        user_id: session.user_id,
        entered_at: new Date(session.entered_at),
        expires_at: new Date(session.expires_at),
        left_at: session.left_at ? new Date(session.left_at) : undefined,
        total_spent: session.total_spent,
      });
    }
  }, [session, form]);

  // معالجة تقديم النموذج
  const handleSubmit = (values: SessionFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحدث</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحدث" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.event_id} value={event.event_id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>معرف المستخدم</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل معرف المستخدم" />
              </FormControl>
              <FormDescription>أدخل معرف المستخدم الذي سيدخل المغارة</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="entered_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>وقت الدخول</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm", { locale: ar })
                        ) : (
                          <span>اختر التاريخ والوقت</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours, 10));
                          newDate.setMinutes(parseInt(minutes, 10));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expires_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>وقت انتهاء الجلسة</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm", { locale: ar })
                        ) : (
                          <span>اختر التاريخ والوقت</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours, 10));
                          newDate.setMinutes(parseInt(minutes, 10));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="left_at"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>وقت الخروج (اختياري)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP HH:mm", { locale: ar })
                      ) : (
                        <span>اختر التاريخ والوقت</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(field.value || new Date());
                        newDate.setHours(parseInt(hours, 10));
                        newDate.setMinutes(parseInt(minutes, 10));
                        field.onChange(newDate);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>اترك هذا الحقل فارغاً للجلسات النشطة</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_spent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>إجمالي المبلغ المنفق</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>المبلغ الإجمالي الذي تم إنفاقه خلال هذه الجلسة</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button variant="outline" type="button" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">
            {session ? 'تحديث الجلسة' : 'إنشاء جلسة'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CaveSessionForm;