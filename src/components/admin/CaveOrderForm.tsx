import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { caveService } from '@/services/caveService';
import { CaveOrder } from '@/types/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// تعريف مخطط التحقق من صحة النموذج
const orderFormSchema = z.object({
  event_id: z.string({
    required_error: 'يرجى اختيار الحدث',
  }),
  session_id: z.string({
    required_error: 'يرجى اختيار الجلسة',
  }),
  user_id: z.string({
    required_error: 'يرجى إدخال معرف المستخدم',
  }),
  amount: z.number({
    required_error: 'يرجى إدخال المبلغ',
    invalid_type_error: 'يجب أن يكون المبلغ رقماً',
  }).min(0, 'يجب أن يكون المبلغ 0 أو أكثر'),
  paid_with: z.enum(['points', 'cash', 'both'], {
    required_error: 'يرجى اختيار طريقة الدفع',
  }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface CaveOrderFormProps {
  order?: CaveOrder;
  onSubmit: (data: OrderFormValues) => void;
  onCancel: () => void;
}

const CaveOrderForm: React.FC<CaveOrderFormProps> = ({ order, onSubmit, onCancel }) => {
  // جلب قائمة الأحداث
  const { data: events } = useQuery({
    queryKey: ['cave-events'],
    queryFn: caveService.getEvents,
  });

  // إعداد نموذج React Hook Form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      event_id: '',
      session_id: '',
      user_id: '',
      amount: 0,
      paid_with: 'cash',
    },
  });

  // الحصول على معرف الحدث المحدد
  const selectedEventId = form.watch('event_id');

  // جلب جلسات الحدث المحدد
  const { data: sessions } = useQuery({
    queryKey: ['cave-sessions', selectedEventId],
    queryFn: () => selectedEventId ? caveService.getSessions(selectedEventId) : Promise.resolve([]),
    enabled: !!selectedEventId,
  });

  // تحديث قيم النموذج عند تغيير الطلب
  useEffect(() => {
    if (order) {
      form.reset({
        event_id: order.event_id,
        session_id: order.session_id,
        user_id: order.user_id,
        amount: order.amount,
        paid_with: order.paid_with,
      });
    }
  }, [order, form]);

  // معالجة تقديم النموذج
  const handleSubmit = (values: OrderFormValues) => {
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
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('session_id', ''); // إعادة تعيين الجلسة عند تغيير الحدث
                }}
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
          name="session_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجلسة</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={!selectedEventId || !sessions?.length}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجلسة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessions?.map((session) => (
                    <SelectItem key={session.session_id} value={session.session_id}>
                      {`جلسة ${session.user_id} (${new Date(session.entered_at).toLocaleString('ar-EG')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {!selectedEventId ? 'اختر الحدث أولاً' : !sessions?.length ? 'لا توجد جلسات لهذا الحدث' : ''}
              </FormDescription>
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
              <FormDescription>أدخل معرف المستخدم الذي قام بالطلب</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>المبلغ المدفوع في هذا الطلب</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paid_with"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>طريقة الدفع</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="cash" />
                    </FormControl>
                    <FormLabel className="font-normal">نقداً</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="points" />
                    </FormControl>
                    <FormLabel className="font-normal">نقاط</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <RadioGroupItem value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">نقداً ونقاط</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button variant="outline" type="button" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">
            {order ? 'تحديث الطلب' : 'إنشاء طلب'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CaveOrderForm;