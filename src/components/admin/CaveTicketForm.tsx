import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CaveTicket, CaveEvent } from '@/types/db';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// تعريف مخطط التحقق من صحة البيانات باستخدام Zod
const ticketFormSchema = z.object({
  code: z.string().min(3, { message: 'يجب أن يحتوي كود التذكرة على 3 أحرف على الأقل' }),
  event_id: z.string({
    required_error: 'يرجى اختيار الحدث',
  }),
  max_use: z.coerce.number().int().min(1, { message: 'يجب أن يكون الحد الأقصى للاستخدام 1 على الأقل' }),
  per_user_limit: z.coerce.number().int().min(1, { message: 'يجب أن يكون حد المستخدم 1 على الأقل' }),
  is_personal: z.boolean().default(false),
  owner_user: z.string().optional(),
  is_active: z.boolean().default(true),
  expiry: z.date().optional().nullable(),
}).refine(data => !data.is_personal || (data.is_personal && data.owner_user && data.owner_user.length > 0), {
  message: 'يجب تحديد المستخدم المالك للتذكرة الشخصية',
  path: ['owner_user'],
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface CaveTicketFormProps {
  initialData: CaveTicket | null;
  events: CaveEvent[];
  onSubmit: (data: Partial<CaveTicket>) => void;
  onCancel: () => void;
}

const CaveTicketForm: React.FC<CaveTicketFormProps> = ({
  initialData,
  events,
  onSubmit,
  onCancel
}) => {
  // تهيئة نموذج React Hook Form مع التحقق من صحة البيانات باستخدام Zod
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: initialData ? {
      code: initialData.code,
      event_id: initialData.event_id,
      max_use: initialData.max_use,
      per_user_limit: initialData.per_user_limit,
      is_personal: initialData.is_personal,
      owner_user: initialData.owner_user || '',
      is_active: initialData.is_active,
      expiry: initialData.expiry ? new Date(initialData.expiry) : null,
    } : {
      code: '',
      event_id: events.length > 0 ? events[0].event_id : null,
      max_use: 1,
      per_user_limit: 1,
      is_personal: false,
      owner_user: null,
      is_active: true,
      expiry: null,
    }
  });

  // معالجة تقديم النموذج
  const handleSubmit = (values: TicketFormValues) => {
    console.log('Submitting ticket form:', values);
    onSubmit({
      ...values,
      expiry: values.expiry ? values.expiry.toISOString() : null,
    });
  };

  // معالجة أحداث النموذج
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission triggered');
    form.handleSubmit(handleSubmit)(e);
  };

  // مراقبة تغيير حقل التذكرة الشخصية
  const isPersonal = form.watch('is_personal');

  // توليد كود تذكرة عشوائي
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    form.setValue('code', result);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* حقل كود التذكرة */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كود التذكرة</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="أدخل كود التذكرة" {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateRandomCode}
                  >
                    توليد
                  </Button>
                </div>
                <FormDescription>
                  كود فريد للتذكرة يستخدمه المستخدمون للدخول إلى المغارة
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل الحدث */}
          <FormField
            control={form.control}
            name="event_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحدث</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحدث" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.event_id} value={event.event_id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  الحدث الذي ستستخدم فيه هذه التذكرة
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل الحد الأقصى للاستخدام */}
          <FormField
            control={form.control}
            name="max_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأقصى للاستخدام</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  عدد المرات التي يمكن استخدام هذه التذكرة فيها
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل حد المستخدم */}
          <FormField
            control={form.control}
            name="per_user_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حد المستخدم</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  عدد المرات التي يمكن لكل مستخدم استخدام هذه التذكرة
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل تاريخ انتهاء الصلاحية */}
          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ انتهاء الصلاحية (اختياري)</FormLabel>
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
                          format(field.value, "PPP", { locale: ar })
                        ) : (
                          <span>اختر تاريخ انتهاء الصلاحية</span>
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
                      locale={ar}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  تاريخ انتهاء صلاحية التذكرة (اتركه فارغاً إذا كانت التذكرة غير محدودة الصلاحية)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل التذكرة الشخصية */}
          <FormField
            control={form.control}
            name="is_personal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">تذكرة شخصية</FormLabel>
                  <FormDescription>
                    هل هذه التذكرة مخصصة لمستخدم محدد فقط؟
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* حقل المستخدم المالك (يظهر فقط إذا كانت التذكرة شخصية) */}
          {isPersonal && (
            <FormField
              control={form.control}
              name="owner_user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المستخدم المالك</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل معرف المستخدم" {...field} />
                  </FormControl>
                  <FormDescription>
                    معرف المستخدم الذي يمكنه استخدام هذه التذكرة
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* حقل الحالة */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">الحالة</FormLabel>
                  <FormDescription>
                    تفعيل أو تعطيل هذه التذكرة
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button 
            type="submit" 
            onClick={(e) => {
              console.log('Submit button clicked');
              handleFormSubmit(e);
            }}
          >
            {initialData ? 'تحديث التذكرة' : 'إضافة التذكرة'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CaveTicketForm;