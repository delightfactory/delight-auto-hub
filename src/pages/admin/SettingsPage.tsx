
import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Mail, MessageSquare, Lock, Shield, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService } from '@/services/adminService';
import { SiteSettings } from '@/types/db';

// مخطط إعدادات الموقع
const siteSettingsSchema = z.object({
  siteName: z.string().min(2, "اسم الموقع مطلوب"),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email("البريد الإلكتروني غير صالح"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  enableRegistration: z.boolean().default(true),
  enableComments: z.boolean().default(true),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

const SettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // استعلام لجلب إعدادات الموقع
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getSiteSettings
  });
  
  // إعداد المعالج لحفظ الإعدادات
  const saveMutation = useMutation({
    mutationFn: (data: SiteSettings) => siteSettingsService.updateSiteSettings(data),
    onSuccess: () => {
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات الموقع بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
    onError: (error) => {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات",
        variant: "destructive"
      });
    }
  });
  
  // نموذج الإعدادات
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      phoneNumber: "",
      address: "",
      enableRegistration: true,
      enableComments: true,
    },
  });
  
  // تحديث قيم النموذج عند تحميل البيانات
  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription || "",
        contactEmail: settings.contactEmail,
        phoneNumber: settings.phoneNumber || "",
        address: settings.address || "",
        enableRegistration: settings.enableRegistration,
        enableComments: settings.enableComments,
      });
    }
  }, [settings, form]);
  
  // معالج حفظ الإعدادات
  const onSubmit = (data: SiteSettingsFormValues) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-lg font-medium">جارِ تحميل الإعدادات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg font-medium text-red-500">حدث خطأ أثناء تحميل الإعدادات</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['site-settings'] })}
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إعدادات الموقع</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* إعدادات الموقع الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                إعدادات عامة
              </CardTitle>
              <CardDescription>
                تعديل الإعدادات الأساسية للموقع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموقع</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      سيظهر هذا الاسم في عنوان الموقع والشعار
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الموقع</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder="أدخل وصفاً مختصراً للموقع"
                      />
                    </FormControl>
                    <FormDescription>
                      سيظهر هذا الوصف في نتائج محركات البحث
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* معلومات الاتصال */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                معلومات الاتصال
              </CardTitle>
              <CardDescription>
                تعديل معلومات الاتصال الخاصة بالموقع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني للتواصل</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* إعدادات المتجر والتفاعل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                إعدادات المتجر والتفاعل
              </CardTitle>
              <CardDescription>
                إدارة خيارات المتجر والتفاعل مع المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enableRegistration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        تسجيل المستخدمين
                      </FormLabel>
                      <FormDescription>
                        السماح للزوار بإنشاء حسابات جديدة في الموقع
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
              
              <FormField
                control={form.control}
                name="enableComments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        التعليقات
                      </FormLabel>
                      <FormDescription>
                        السماح للمستخدمين بإضافة تعليقات على المنتجات والمقالات
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
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="px-8"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارِ الحفظ...
                </>
              ) : (
                'حفظ الإعدادات'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsPage;
