
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService } from '@/services/settingsService';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/hooks/use-toast';
import { SiteSettings } from '@/types/db';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings, Mail, Phone, MapPin, User, Globe, PanelLeft, Info } from 'lucide-react';

// تعريف مخطط التحقق
const settingsFormSchema = z.object({
  siteName: z.string().min(1, "اسم الموقع مطلوب"),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email("البريد الإلكتروني غير صالح"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  enableRegistration: z.boolean().default(true),
  enableComments: z.boolean().default(true),
});

const SettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  // استعلام لجلب إعدادات الموقع
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getSiteSettings
  });
  
  // إعداد نموذج التحقق
  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      phoneNumber: "",
      address: "",
      enableRegistration: true,
      enableComments: false,
    },
  });
  
  // تحديث قيم النموذج عند تحميل الإعدادات
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
  
  // إعداد المعالج لحفظ الإعدادات
  const saveMutation = useMutation({
    mutationFn: (data: Partial<SiteSettings>) => siteSettingsService.updateSiteSettings(data),
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
        description: "حدث خطأ أثناء محاولة حفظ إعدادات الموقع",
        variant: "destructive"
      });
    }
  });
  
  // معالجة تقديم النموذج
  const onSubmit = (data: z.infer<typeof settingsFormSchema>) => {
    saveMutation.mutate({
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      contactEmail: data.contactEmail,
      phoneNumber: data.phoneNumber,
      address: data.address,
      enableRegistration: data.enableRegistration,
      enableComments: data.enableComments,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-lg font-medium">جارِ تحميل إعدادات الموقع...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg font-medium text-red-500">حدث خطأ أثناء تحميل إعدادات الموقع</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الموقع</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة وتكوين إعدادات الموقع الرئيسية</p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جارِ الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="flex items-center">
                <Settings className="w-4 h-4 ml-2" />
                عام
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center">
                <Mail className="w-4 h-4 ml-2" />
                معلومات الاتصال
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center">
                <PanelLeft className="w-4 h-4 ml-2" />
                الميزات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 ml-2" />
                    المعلومات الأساسية
                  </CardTitle>
                  <CardDescription>المعلومات الأساسية للموقع</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الموقع</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل اسم الموقع" />
                        </FormControl>
                        <FormDescription>
                          سيظهر هذا الاسم في العنوان وفي جميع أنحاء الموقع
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
                          <Input {...field} placeholder="أدخل وصف الموقع" />
                        </FormControl>
                        <FormDescription>
                          وصف قصير للموقع، سيظهر في نتائج البحث وعلامات التعريف
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 ml-2" />
                    معلومات الاتصال
                  </CardTitle>
                  <CardDescription>معلومات الاتصال للموقع</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني للتواصل</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="أدخل البريد الإلكتروني" />
                        </FormControl>
                        <FormDescription>
                          سيتم استخدام هذا البريد للاتصال وتلقي الإشعارات
                        </FormDescription>
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
                          <Input {...field} placeholder="أدخل رقم الهاتف" />
                        </FormControl>
                        <FormDescription>
                          رقم الهاتف للتواصل مع الموقع
                        </FormDescription>
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
                          <Input {...field} placeholder="أدخل العنوان" />
                        </FormControl>
                        <FormDescription>
                          العنوان الفعلي للموقع أو المتجر
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PanelLeft className="w-5 h-5 ml-2" />
                    الميزات
                  </CardTitle>
                  <CardDescription>تفعيل أو تعطيل ميزات الموقع</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableRegistration"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">تسجيل المستخدمين</FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بإنشاء حسابات جديدة في الموقع
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">التعليقات</FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بالتعليق على المنتجات والمقالات
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
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default SettingsPage;
