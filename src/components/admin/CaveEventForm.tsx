import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CaveEvent } from '@/types/db';
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
import { Textarea } from '@/components/ui/textarea';
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
const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'يجب أن يحتوي العنوان على 3 أحرف على الأقل' }),
  description: z.string().min(10, { message: 'يجب أن يحتوي الوصف على 10 أحرف على الأقل' }),
  kind: z.enum(['scheduled', 'ticketed'], {
    required_error: 'يرجى اختيار نوع الحدث',
  }),
  start_time: z.date({
    required_error: 'يرجى اختيار تاريخ البدء',
  }),
  end_time: z.date({
    required_error: 'يرجى اختيار تاريخ الانتهاء',
  }),
  max_concurrent: z.coerce.number().int().min(1, { message: 'يجب أن يكون الحد الأقصى للمستخدمين 1 على الأقل' }),
  user_time_limit: z.coerce.number().int().min(1, { message: 'يجب أن يكون حد وقت المستخدم 1 دقيقة على الأقل' }),
  purchase_cap: z.coerce.number().int().min(0, { message: 'يجب أن يكون حد الشراء 0 على الأقل' }),
  allowed_pay: z.enum(['points', 'cash', 'both'], {
    required_error: 'يرجى اختيار طرق الدفع المسموح بها',
  }),
  is_active: z.boolean().default(true),
}).refine(data => data.end_time > data.start_time, {
  message: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء',
  path: ['end_time'],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CaveEventFormProps {
  initialData: CaveEvent | null;
  onSubmit: (data: Partial<CaveEvent>) => void;
  onCancel: () => void;
}

const CaveEventForm: React.FC<CaveEventFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // تهيئة نموذج React Hook Form مع التحقق من صحة البيانات باستخدام Zod
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      kind: initialData.kind as 'scheduled' | 'ticketed',
      start_time: new Date(initialData.start_time),
      end_time: new Date(initialData.end_time),
      max_concurrent: initialData.max_concurrent,
      user_time_limit: initialData.user_time_limit,
      purchase_cap: initialData.purchase_cap,
      allowed_pay: initialData.allowed_pay as 'points' | 'cash' | 'both',
      is_active: initialData.is_active,
    } : {
      title: '',
      description: '',
      kind: 'scheduled',
      start_time: new Date(),
      end_time: new Date(new Date().setDate(new Date().getDate() + 1)),
      max_concurrent: 10,
      user_time_limit: 30,
      purchase_cap: 0,
      allowed_pay: 'both',
      is_active: true,
    }
  });

  // معالجة تقديم النموذج
  const handleSubmit = (values: EventFormValues) => {
    onSubmit({
      ...values,
      start_time: values.start_time.toISOString(),
      end_time: values.end_time.toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* حقل العنوان */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان الحدث</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل عنوان الحدث" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل نوع الحدث */}
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الحدث</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحدث" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">مجدول</SelectItem>
                    <SelectItem value="ticketed">بالتذكرة</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  المجدول: يمكن للمستخدمين الدخول خلال فترة الحدث. بالتذكرة: يتطلب تذكرة للدخول.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل تاريخ البدء */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ البدء</FormLabel>
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
                          <span>اختر تاريخ ووقت البدء</span>
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
                      locale={ar}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
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
          
          {/* حقل تاريخ الانتهاء */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ الانتهاء</FormLabel>
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
                          <span>اختر تاريخ ووقت الانتهاء</span>
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
                      locale={ar}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
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
          
          {/* حقل الحد الأقصى للمستخدمين المتزامنين */}
          <FormField
            control={form.control}
            name="max_concurrent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأقصى للمستخدمين المتزامنين</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  أقصى عدد من المستخدمين يمكنهم التواجد في المغارة في نفس الوقت
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل حد وقت المستخدم */}
          <FormField
            control={form.control}
            name="user_time_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حد وقت المستخدم (بالدقائق)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  الوقت المسموح به لكل مستخدم داخل المغارة (بالدقائق)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل حد الشراء */}
          <FormField
            control={form.control}
            name="purchase_cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حد الشراء</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  الحد الأقصى لعدد مرات الشراء لكل مستخدم (0 = غير محدود)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل طرق الدفع المسموح بها */}
          <FormField
            control={form.control}
            name="allowed_pay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>طرق الدفع المسموح بها</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طرق الدفع" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="points">نقاط فقط</SelectItem>
                    <SelectItem value="cash">نقدي فقط</SelectItem>
                    <SelectItem value="both">نقاط ونقدي</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل الحالة */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">الحالة</FormLabel>
                  <FormDescription>
                    تفعيل أو تعطيل هذا الحدث
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
        
        {/* حقل الوصف */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الحدث</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل وصفاً تفصيلياً للحدث"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit">
            {initialData ? 'تحديث الحدث' : 'إضافة الحدث'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CaveEventForm;