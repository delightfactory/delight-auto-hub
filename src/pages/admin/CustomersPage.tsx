
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { customerService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import CustomerList from '@/components/admin/customers/CustomerList';

const CustomersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: customers = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: customerService.getAllCustomers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });
  
  const handleRoleUpdate = async (id: string, role: 'admin' | 'customer') => {
    try {
      await customerService.updateCustomerRole(id, role);
      toast({
        title: "تم تحديث الصلاحية",
        description: `تم تغيير صلاحية المستخدم إلى ${role === 'admin' ? 'مسؤول' : 'عميل'}`
      });
      refetch();
    } catch (error) {
      console.error("خطأ في تحديث الصلاحية:", error);
      toast({
        title: "خطأ في تحديث الصلاحية",
        description: "حدث خطأ أثناء محاولة تحديث صلاحية المستخدم",
        variant: "destructive"
      });
    }
  };
  
  // تصفية العملاء بناءً على مصطلح البحث
  const filteredCustomers = searchTerm && customers
    ? customers.filter((customer: any) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن عميل..."
              className="pr-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <CustomerList 
        customers={filteredCustomers} 
        isLoading={isLoading}
        handleRoleUpdate={handleRoleUpdate}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default CustomersPage;
