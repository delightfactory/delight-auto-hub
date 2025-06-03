import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// استيراد المكونات من المسارات الصحيحة
import AdminLayout from '../../../components/layouts/AdminLayout';
import GovernoratesTable from '../../../components/admin/GovernoratesTable';
import CitiesTable from '../../../components/admin/CitiesTable';

export default function ShippingManagementPage() {
  const [activeTab, setActiveTab] = useState('governorates');

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">إدارة الشحن</h1>
        
        <Tabs defaultValue="governorates" value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="governorates">المحافظات</TabsTrigger>
            <TabsTrigger value="cities">المدن</TabsTrigger>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
