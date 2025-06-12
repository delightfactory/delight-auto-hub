import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import GovernoratesTable from '@/components/admin/shipping/GovernoratesTable';
import CitiesTable from '@/components/admin/shipping/CitiesTable';
import BranchesTable from '@/components/admin/shipping/BranchesTable';
import PickupPointsTable from '@/components/admin/shipping/PickupPointsTable';
import { supabase } from '@/integrations/supabase/client';

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState('governorates');
  const [checkingDb, setCheckingDb] = useState(false);
  const [dbResults, setDbResults] = useState<{success: boolean; message: string; count?: number; data?: any}>();

  // وظيفة للتحقق من وجود المحافظات في قاعدة البيانات
  const checkGovernorates = async () => {
    setCheckingDb(true);
    setDbResults(undefined);
    
    try {
      // التحقق من اتصال Supabase
      if (!supabase) {
        throw new Error('لم يتم تهيئة اتصال Supabase');
      }
      
      // جلب المحافظات من قاعدة البيانات
      const { data, error, count } = await supabase
        .from('governorates')
        .select('*', { count: 'exact' });
      
      if (error) {
        throw error;
      }
      
      // عرض النتائج
      setDbResults({
        success: true,
        message: data && data.length > 0 
          ? `تم العثور على ${data.length} محافظة في قاعدة البيانات` 
          : 'لم يتم العثور على أي محافظات في قاعدة البيانات',
        count: data?.length || 0,
        data: data
      });
      
      console.log('Governorates check result:', data);
    } catch (error) {
      console.error('Error checking governorates:', error);
      setDbResults({
        success: false,
        message: `حدث خطأ أثناء التحقق من قاعدة البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      });
    } finally {
      setCheckingDb(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">إدارة الشحن</h1>
      
      {/* أداة التحقق من قاعدة البيانات */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">أداة تشخيص قاعدة البيانات</CardTitle>
            <CardDescription>
              استخدم هذه الأداة للتحقق من وجود بيانات المحافظات في قاعدة البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={checkGovernorates} 
                disabled={checkingDb}
                className="w-full md:w-auto"
              >
                {checkingDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  'التحقق من وجود المحافظات'
                )}
              </Button>
              
              {dbResults && (
                <Alert variant={dbResults.success ? "default" : "destructive"}>
                  <AlertTitle>{dbResults.success ? "نجاح" : "خطأ"}</AlertTitle>
                  <AlertDescription>
                    {dbResults.message}
                    {dbResults.data && dbResults.data.length > 0 && (
                      <div className="mt-2">
                        <p className="font-bold">أول محافظة:</p>
                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto rtl:text-right">
                          {JSON.stringify(dbResults.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="governorates" value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="governorates">المحافظات</TabsTrigger>
          <TabsTrigger value="cities">المدن</TabsTrigger>
          <TabsTrigger value="branches">الفروع</TabsTrigger>
          <TabsTrigger value="pickup_points">نقاط الاستلام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="governorates">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المحافظات</CardTitle>
              <CardDescription>
                إضافة وتعديل وحذف المحافظات المتاحة للشحن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GovernoratesTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المدن</CardTitle>
              <CardDescription>
                إضافة وتعديل وحذف المدن وتحديد رسوم الشحن لكل مدينة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CitiesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الفروع</CardTitle>
              <CardDescription>
                إضافة وتعديل وحذف فروع الشركة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickup_points">
          <Card>
            <CardHeader>
              <CardTitle>إدارة نقاط الاستلام</CardTitle>
              <CardDescription>
                إضافة وتعديل وحذف نقاط الاستلام المتاحة للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PickupPointsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
