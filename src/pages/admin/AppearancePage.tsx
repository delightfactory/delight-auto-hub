import React, { useEffect, useState } from 'react';
import { 
  Palette, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Layout, 
  Type, 
  Image,
  Loader2,
  Save
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appearanceService } from '@/services/adminService';
import { AppearanceSettings } from '@/types/db';

const AppearancePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [formState, setFormState] = useState<Partial<AppearanceSettings>>({
    theme: {
      primaryColor: "#FF0000",
      secondaryColor: "#0000FF",
      textColor: "#333333",
      backgroundColor: "#FFFFFF"
    },
    layout: "fluid",
    contentWidth: "large",
    darkMode: true,
    responsive: {
      mobile: { enabled: true, collapsibleMenu: true },
      tablet: { enabled: true, sidebarMenu: true },
      desktop: { enabled: true, topMenu: true }
    },
    fonts: {
      heading: "Cairo",
      body: "Tajawal"
    },
    homeSettings: {
      showBanner: false,
      showFeaturedProducts: true,
      showNewProducts: true,
      showTestimonials: false
    },
    logo: "",
    favicon: ""
  });
  
  // استعلام لجلب إعدادات المظهر
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['appearance-settings'],
    queryFn: appearanceService.getAppearanceSettings
  });
  
  // إعداد المعالج لحفظ الإعدادات
  const saveMutation = useMutation({
    mutationFn: (data: AppearanceSettings) => appearanceService.updateAppearanceSettings(data),
    onSuccess: () => {
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات المظهر بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['appearance-settings'] });
    },
    onError: (error) => {
      console.error("خطأ في حفظ إعدادات المظهر:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ إعدادات المظهر",
        variant: "destructive"
      });
    }
  });
  
  // تحديث نموذج البيانات عند تحميل الإعدادات
  useEffect(() => {
    if (settings) {
      setFormState(settings as AppearanceSettings);
    }
  }, [settings]);
  
  // معالجة تغيير اللون
  const handleColorChange = (colorType: keyof typeof formState.theme, value: string) => {
    setFormState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme!,
        [colorType]: value,
      },
    }));
  };
  
  // معالجة تغيير التخطيط
  const handleLayoutChange = (layoutType: 'layout' | 'contentWidth', value: string) => {
    setFormState((prev) => ({
      ...prev,
      [layoutType]: value,
    }));
  };
  
  // معالجة تغيير الوضع المظلم
  const handleDarkModeChange = (enabled: boolean) => {
    setFormState((prev) => ({
      ...prev,
      darkMode: enabled,
    }));
  };
  
  // معالجة تغيير إعدادات الاستجابة
  const handleResponsiveChange = (deviceType: 'mobile' | 'tablet' | 'desktop', setting: 'enabled' | 'collapsibleMenu' | 'sidebarMenu' | 'topMenu', value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      responsive: {
        ...prev.responsive!,
        [deviceType]: {
          ...prev.responsive![deviceType],
          [setting]: value,
        },
      },
    }));
  };
  
  // معالجة تغيير الخطوط
  const handleFontChange = (fontType: 'heading' | 'body', value: string) => {
    setFormState((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts!,
        [fontType]: value,
      },
    }));
  };
  
  // معالجة رفع الشعار
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);
      
      // تحديث الشعار في الإعدادات
      setFormState((prev) => ({
        ...prev,
        logo: publicUrl,
      }));
      
      toast({
        title: "تم رفع الشعار",
        description: "تم رفع الشعار بنجاح"
      });
    } catch (error) {
      console.error("خطأ في رفع الشعار:", error);
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء محاولة رفع الشعار",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  // معالجة رفع الأيقونة
  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon_${Date.now()}.${fileExt}`;
      const filePath = `favicons/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);
      
      // تحديث الأيقونة في الإعدادات
      setFormState((prev) => ({
        ...prev,
        favicon: publicUrl,
      }));
      
      toast({
        title: "تم رفع الأيقونة",
        description: "تم رفع أيقونة المتصفح بنجاح"
      });
    } catch (error) {
      console.error("خطأ في رفع الأيقونة:", error);
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء محاولة رفع الأيقونة",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  // حفظ إعدادات المظهر
  const handleSaveAppearance = () => {
    saveMutation.mutate(formState as AppearanceSettings);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-lg font-medium">جارِ تحميل إعدادات المظهر...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg font-medium text-red-500">حدث خطأ أثناء تحميل إعدادات المظهر</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['appearance-settings'] })}
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
          <h1 className="text-2xl font-bold">المظهر والتخصيص</h1>
          <p className="text-gray-500 dark:text-gray-400">تخصيص مظهر موقعك وتجربة المستخدم</p>
        </div>
        <Button 
          onClick={handleSaveAppearance}
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
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="home">الصفحة الرئيسية</TabsTrigger>
          <TabsTrigger value="colors">الألوان</TabsTrigger>
          <TabsTrigger value="fonts">الخطوط</TabsTrigger>
          <TabsTrigger value="responsive">الاستجابة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الشعار والأيقونات</CardTitle>
              <CardDescription>تخصيص شعار وأيقونات موقعك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الشعار الرئيسي</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center h-32">
                    {formState.logo ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={formState.logo} 
                          alt="الشعار الرئيسي" 
                          className="object-contain w-full h-full"
                        />
                        <label className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-sm text-white">انقر لتغيير الشعار</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للتحميل</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>أيقونة المتصفح</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center h-32">
                    {formState.favicon ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={formState.favicon} 
                          alt="أيقونة المتصفح" 
                          className="object-contain w-32 h-32 mx-auto"
                        />
                        <label className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-sm text-white">انقر لتغيير الأيقونة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFaviconUpload}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Image className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">حجم موصى به: 32×32</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFaviconUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">دعم الوضع الداكن</Label>
                  <Switch 
                    id="darkMode" 
                    checked={formState.darkMode} 
                    onCheckedChange={handleDarkModeChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>التخطيط العام</CardTitle>
              <CardDescription>تكوين التخطيط العام للموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="layoutType">نوع التخطيط</Label>
                  <Select 
                    value={formState.layout}
                    onValueChange={(value: any) => handleLayoutChange('layout', value)}
                  >
                    <SelectTrigger id="layoutType">
                      <SelectValue placeholder="اختر نوع التخطيط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fluid">سلس (Fluid)</SelectItem>
                      <SelectItem value="fixed">ثابت (Fixed)</SelectItem>
                      <SelectItem value="boxed">إطار (Boxed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contentWidth">عرض المحتوى</Label>
                  <Select 
                    value={formState.contentWidth}
                    onValueChange={(value: any) => handleLayoutChange('contentWidth', value)}
                  >
                    <SelectTrigger id="contentWidth">
                      <SelectValue placeholder="اختر عرض المحتوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">ضيق</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">واسع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="home" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الصفحة الرئيسية</CardTitle>
              <CardDescription>تخصيص عرض الصفحة الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>عرض البانر الترويجي</Label>
                  <Switch 
                    checked={formState.homeSettings?.showBanner || false} 
                    onCheckedChange={(value) => setFormState(prev => ({
                      ...prev,
                      homeSettings: {
                        showBanner: value,
                        showFeaturedProducts: prev.homeSettings?.showFeaturedProducts || true,
                        showNewProducts: prev.homeSettings?.showNewProducts || true,
                        showTestimonials: prev.homeSettings?.showTestimonials || false
                      }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>عرض المنتجات المميزة</Label>
                  <Switch 
                    checked={formState.homeSettings?.showFeaturedProducts || false} 
                    onCheckedChange={(value) => setFormState(prev => ({
                      ...prev,
                      homeSettings: {
                        showBanner: prev.homeSettings?.showBanner || false,
                        showFeaturedProducts: value,
                        showNewProducts: prev.homeSettings?.showNewProducts || true,
                        showTestimonials: prev.homeSettings?.showTestimonials || false
                      }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>عرض المنتجات الجديدة</Label>
                  <Switch 
                    checked={formState.homeSettings?.showNewProducts || false} 
                    onCheckedChange={(value) => setFormState(prev => ({
                      ...prev,
                      homeSettings: {
                        showBanner: prev.homeSettings?.showBanner || false,
                        showFeaturedProducts: prev.homeSettings?.showFeaturedProducts || true,
                        showNewProducts: value,
                        showTestimonials: prev.homeSettings?.showTestimonials || false
                      }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>عرض قسم الشهادات</Label>
                  <Switch 
                    checked={formState.homeSettings?.showTestimonials || false} 
                    onCheckedChange={(value) => setFormState(prev => ({
                      ...prev,
                      homeSettings: {
                        showBanner: prev.homeSettings?.showBanner || false,
                        showFeaturedProducts: prev.homeSettings?.showFeaturedProducts || true,
                        showNewProducts: prev.homeSettings?.showNewProducts || true,
                        showTestimonials: value
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نظام الألوان</CardTitle>
              <CardDescription>تخصيص ألوان موقعك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>اللون الرئيسي</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10" 
                      value={formState.theme?.primaryColor || '#FF0000'}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    />
                    <Input 
                      type="text" 
                      value={formState.theme?.primaryColor || '#FF0000'}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>اللون الثانوي</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10" 
                      value={formState.theme?.secondaryColor || '#0000FF'}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    />
                    <Input 
                      type="text" 
                      value={formState.theme?.secondaryColor || '#0000FF'}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>لون النص</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10" 
                      value={formState.theme?.textColor || '#333333'}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                    />
                    <Input 
                      type="text" 
                      value={formState.theme?.textColor || '#333333'}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>لون الخلفية</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      className="w-16 h-10" 
                      value={formState.theme?.backgroundColor || '#FFFFFF'}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    />
                    <Input 
                      type="text" 
                      value={formState.theme?.backgroundColor || '#FFFFFF'}
                      onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>معاينة الألوان</CardTitle>
              <CardDescription>معاينة مباشرة للألوان المختارة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: formState.theme?.backgroundColor || '#FFFFFF' }}
                >
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: formState.theme?.textColor || '#333333' }}
                  >
                    عنوان النموذج
                  </h3>
                  <p 
                    className="mb-4"
                    style={{ color: formState.theme?.textColor || '#333333' }}
                  >
                    هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربي.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button 
                      className="px-4 py-2 rounded-md"
                      style={{ 
                        backgroundColor: formState.theme?.primaryColor || '#FF0000',
                        color: '#FFFFFF'
                      }}
                    >
                      زر رئيسي
                    </button>
                    <button 
                      className="px-4 py-2 rounded-md"
                      style={{ 
                        backgroundColor: formState.theme?.secondaryColor || '#0000FF',
                        color: '#FFFFFF'
                      }}
                    >
                      زر ثانوي
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fonts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الخطوط</CardTitle>
              <CardDescription>تخصيص خطوط موقعك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>خط العناوين</Label>
                  <Select 
                    value={formState.fonts?.heading || "Cairo"}
                    onValueChange={(value) => handleFontChange('heading', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر خط العناوين" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cairo">Cairo</SelectItem>
                      <SelectItem value="Almarai">Almarai</SelectItem>
                      <SelectItem value="Tajawal">Tajawal</SelectItem>
                      <SelectItem value="DroidKufi">Droid Kufi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>خط النص</Label>
                  <Select 
                    value={formState.fonts?.body || "Tajawal"}
                    onValueChange={(value) => handleFontChange('body', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر خط النص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cairo">Cairo</SelectItem>
                      <SelectItem value="Almarai">Almarai</SelectItem>
                      <SelectItem value="Tajawal">Tajawal</SelectItem>
                      <SelectItem value="DroidKufi">Droid Kufi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 p-4 border rounded-lg">
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: formState.fonts?.heading || "Cairo" }}>
                  عنوان النموذج بالخط: {formState.fonts?.heading || "Cairo"}
                </h3>
                <p style={{ fontFamily: formState.fonts?.body || "Tajawal" }}>
                  هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربي، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responsive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الاستجابة</CardTitle>
              <CardDescription>تخصيص مظهر موقعك على مختلف الأجهزة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> الهاتف المحمول
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>تفعيل</Label>
                        <Switch 
                          checked={formState.responsive?.mobile.enabled || false}
                          onCheckedChange={(value) => handleResponsiveChange('mobile', 'enabled', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة منسدلة</Label>
                        <Switch 
                          checked={formState.responsive?.mobile.collapsibleMenu || false}
                          onCheckedChange={(value) => handleResponsiveChange('mobile', 'collapsibleMenu', value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tablet className="w-4 h-4" /> الأجهزة اللوحية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>تفعيل</Label>
                        <Switch 
                          checked={formState.responsive?.tablet.enabled || false}
                          onCheckedChange={(value) => handleResponsiveChange('tablet', 'enabled', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة جانبية</Label>
                        <Switch 
                          checked={formState.responsive?.tablet.sidebarMenu || false}
                          onCheckedChange={(value) => handleResponsiveChange('tablet', 'sidebarMenu', value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> سطح المكتب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>تفعيل</Label>
                        <Switch 
                          checked={formState.responsive?.desktop.enabled || false}
                          onCheckedChange={(value) => handleResponsiveChange('desktop', 'enabled', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة علوية</Label>
                        <Switch 
                          checked={formState.responsive?.desktop.topMenu || false}
                          onCheckedChange={(value) => handleResponsiveChange('desktop', 'topMenu', value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSaveAppearance}
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
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AppearancePage;
