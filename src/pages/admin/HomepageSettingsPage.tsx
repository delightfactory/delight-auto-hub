
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowRight, ExternalLink, ImagePlus, Trash2 } from "lucide-react";
import { 
  heroSettingsService, 
  ctaSettingsService, 
  navLinksService, 
  testimonialsService,
  footerSettingsService,
  socialLinksService
} from "@/services/homepageService";

const HomepageSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch hero settings
  const { 
    data: heroSettings, 
    isLoading: isLoadingHero 
  } = useQuery({
    queryKey: ['heroSettings'],
    queryFn: heroSettingsService.getHeroSettings
  });
  
  // Fetch CTA settings
  const { 
    data: ctaSettings, 
    isLoading: isLoadingCTA 
  } = useQuery({
    queryKey: ['ctaSettings'],
    queryFn: ctaSettingsService.getCTASettings
  });
  
  // Fetch navigation links
  const { 
    data: navLinks, 
    isLoading: isLoadingNav 
  } = useQuery({
    queryKey: ['navLinks'],
    queryFn: navLinksService.getNavLinks
  });
  
  // Fetch testimonials
  const { 
    data: testimonials, 
    isLoading: isLoadingTestimonials 
  } = useQuery({
    queryKey: ['testimonials'],
    queryFn: testimonialsService.getTestimonials
  });
  
  // State for form values
  const [heroFormValues, setHeroFormValues] = useState({
    title: '',
    subtitle: '',
    background_image_url: '',
    button_text: '',
    button_link: ''
  });
  
  const [ctaFormValues, setCtaFormValues] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    background_color: ''
  });
  
  // Set form values when data is loaded
  React.useEffect(() => {
    if (heroSettings) {
      setHeroFormValues({
        title: heroSettings.title || '',
        subtitle: heroSettings.subtitle || '',
        background_image_url: heroSettings.background_image_url || '',
        button_text: heroSettings.button_text || '',
        button_link: heroSettings.button_link || ''
      });
    }
  }, [heroSettings]);
  
  React.useEffect(() => {
    if (ctaSettings) {
      setCtaFormValues({
        title: ctaSettings.title || '',
        subtitle: ctaSettings.subtitle || '',
        button_text: ctaSettings.button_text || '',
        button_link: ctaSettings.button_link || '',
        background_color: ctaSettings.background_color || '#1e40af'
      });
    }
  }, [ctaSettings]);
  
  // Mutations
  const updateHeroMutation = useMutation({
    mutationFn: (values: any) => heroSettingsService.updateHeroSettings({
      id: heroSettings?.id,
      ...values
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSettings'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات بانر البطل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات",
        variant: "destructive",
      });
      console.error("Error updating hero settings:", error);
    }
  });
  
  const updateCtaMutation = useMutation({
    mutationFn: (values: any) => ctaSettingsService.updateCTASettings({
      id: ctaSettings?.id,
      ...values
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ctaSettings'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات قسم دعوة للتواصل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات",
        variant: "destructive",
      });
      console.error("Error updating CTA settings:", error);
    }
  });
  
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroMutation.mutate(heroFormValues);
  };
  
  const handleSaveCTA = (e: React.FormEvent) => {
    e.preventDefault();
    updateCtaMutation.mutate(ctaFormValues);
  };
  
  if (isLoadingHero || isLoadingCTA) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="mr-2 text-lg font-medium">جاري تحميل الإعدادات...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الصفحة الرئيسية</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة وتكوين محتوى الصفحة الرئيسية</p>
        </div>
        <Button onClick={() => window.open("/", "_blank")}>
          <span>معاينة الصفحة الرئيسية</span>
          <ExternalLink className="mr-2 h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="hero">بانر البطل</TabsTrigger>
          <TabsTrigger value="cta">قسم دعوة للتواصل</TabsTrigger>
          <TabsTrigger value="navigation">روابط القائمة</TabsTrigger>
          <TabsTrigger value="testimonials">الشهادات</TabsTrigger>
          <TabsTrigger value="social">وسائل التواصل</TabsTrigger>
          <TabsTrigger value="footer">الفوتر</TabsTrigger>
        </TabsList>
        
        {/* Hero Banner Settings */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات بانر البطل</CardTitle>
              <CardDescription>
                قسم البانر الرئيسي المعروض في أعلى الصفحة الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveHero} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">العنوان الرئيسي</Label>
                  <Input
                    id="hero-title"
                    value={heroFormValues.title}
                    onChange={(e) => setHeroFormValues(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان البانر الرئيسي"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">النص الفرعي</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={heroFormValues.subtitle}
                    onChange={(e) => setHeroFormValues(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="وصف مختصر للبانر"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-bg">رابط صورة الخلفية</Label>
                  <Input
                    id="hero-bg"
                    value={heroFormValues.background_image_url}
                    onChange={(e) => setHeroFormValues(prev => ({ ...prev, background_image_url: e.target.value }))}
                    placeholder="رابط صورة الخلفية"
                  />
                  {heroFormValues.background_image_url && (
                    <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden">
                      <img 
                        src={heroFormValues.background_image_url} 
                        alt="Hero background preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-btn-text">نص الزر</Label>
                    <Input
                      id="hero-btn-text"
                      value={heroFormValues.button_text}
                      onChange={(e) => setHeroFormValues(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="نص الزر"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hero-btn-link">رابط الزر</Label>
                    <Input
                      id="hero-btn-link"
                      value={heroFormValues.button_link}
                      onChange={(e) => setHeroFormValues(prev => ({ ...prev, button_link: e.target.value }))}
                      placeholder="مثال: /products"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="mt-6"
                  disabled={updateHeroMutation.isPending}
                >
                  {updateHeroMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* CTA Settings */}
        <TabsContent value="cta">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات قسم دعوة للتواصل</CardTitle>
              <CardDescription>
                تخصيص قسم دعوة للتواصل في الصفحة الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCTA} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-title">العنوان</Label>
                  <Input
                    id="cta-title"
                    value={ctaFormValues.title}
                    onChange={(e) => setCtaFormValues(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان القسم"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cta-subtitle">النص الفرعي</Label>
                  <Textarea
                    id="cta-subtitle"
                    value={ctaFormValues.subtitle}
                    onChange={(e) => setCtaFormValues(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="وصف مختصر"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-btn-text">نص الزر</Label>
                    <Input
                      id="cta-btn-text"
                      value={ctaFormValues.button_text}
                      onChange={(e) => setCtaFormValues(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="نص الزر"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cta-btn-link">رابط الزر</Label>
                    <Input
                      id="cta-btn-link"
                      value={ctaFormValues.button_link}
                      onChange={(e) => setCtaFormValues(prev => ({ ...prev, button_link: e.target.value }))}
                      placeholder="مثال: /contact"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cta-bg-color">لون الخلفية</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={ctaFormValues.background_color}
                      onChange={(e) => setCtaFormValues(prev => ({ ...prev, background_color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      id="cta-bg-color"
                      value={ctaFormValues.background_color}
                      onChange={(e) => setCtaFormValues(prev => ({ ...prev, background_color: e.target.value }))}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="mt-6"
                  disabled={updateCtaMutation.isPending}
                >
                  {updateCtaMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Navigation Links */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>إدارة روابط القائمة</CardTitle>
              <CardDescription>
                تحرير روابط القائمة الرئيسية للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNav ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : navLinks && navLinks.length > 0 ? (
                <div className="space-y-4">
                  {/* Navigation content will be implemented here */}
                  <p className="text-center text-gray-500">
                    سيتم تنفيذ واجهة إدارة روابط القائمة قريباً
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-500">لا توجد روابط قائمة متاحة حالياً.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Testimonials */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الشهادات</CardTitle>
              <CardDescription>
                إضافة وتعديل شهادات العملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTestimonials ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : testimonials && testimonials.length > 0 ? (
                <div className="space-y-4">
                  {/* Testimonials content will be implemented here */}
                  <p className="text-center text-gray-500">
                    سيتم تنفيذ واجهة إدارة الشهادات قريباً
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-500">لا توجد شهادات متاحة حالياً.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Social Links */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>إدارة روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>
                إضافة وتعديل روابط وسائل التواصل الاجتماعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500">
                سيتم تنفيذ واجهة إدارة روابط التواصل الاجتماعي قريباً
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Footer Settings */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الفوتر</CardTitle>
              <CardDescription>
                تخصيص محتوى فوتر الموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500">
                سيتم تنفيذ واجهة إعدادات الفوتر قريباً
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomepageSettingsPage;
