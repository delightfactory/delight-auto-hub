
import React from 'react';
import { 
  Palette, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Layout, 
  Type, 
  Image
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AppearancePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">المظهر والتخصيص</h1>
          <p className="text-gray-500 dark:text-gray-400">تخصيص مظهر موقعك وتجربة المستخدم</p>
        </div>
        <Button>حفظ التغييرات</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
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
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للتحميل</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>أيقونة المتصفح</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">حجم موصى به: 32×32</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">دعم الوضع الداكن</Label>
                  <Switch id="darkMode" defaultChecked />
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
                  <Select defaultValue="fluid">
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
                  <Select defaultValue="large">
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
                    <Input type="color" className="w-16 h-10" defaultValue="#FF0000" />
                    <Input type="text" defaultValue="#FF0000" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>اللون الثانوي</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-16 h-10" defaultValue="#0000FF" />
                    <Input type="text" defaultValue="#0000FF" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>لون النص</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-16 h-10" defaultValue="#333333" />
                    <Input type="text" defaultValue="#333333" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>لون الخلفية</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-16 h-10" defaultValue="#FFFFFF" />
                    <Input type="text" defaultValue="#FFFFFF" />
                  </div>
                </div>
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
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة منسدلة</Label>
                        <Switch defaultChecked />
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
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة جانبية</Label>
                        <Switch defaultChecked />
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
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>قائمة علوية</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tabs here */}
      </Tabs>
    </div>
  );
};

export default AppearancePage;
