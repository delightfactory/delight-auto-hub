import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { FileX, Loader2 } from 'lucide-react';
import CustomerListHeader from './CustomerListHeader';
import CustomerListItem from './CustomerListItem';
import type { City } from '@/types/db';

interface CustomerListProps {
  customers: any[];
  isLoading: boolean;
  isCitiesLoading: boolean;
  cities: City[];
  handleRoleUpdate: (id: string, role: 'admin' | 'customer') => Promise<void>;
  searchTerm: string;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers,
  isLoading,
  isCitiesLoading,
  cities,
  handleRoleUpdate,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-lg font-medium">جارِ تحميل العملاء...</p>
      </div>
    );
  }
  
  if (customers.length === 0) {
    return (
      <div className="py-24 text-center">
        <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          {searchTerm ? "لا يوجد عملاء مطابقين" : "لا يوجد عملاء"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchTerm
            ? "لم نتمكن من العثور على عملاء يطابقون عملية البحث"
            : "لم يتم تسجيل أي عملاء بعد"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto">
      <Table>
        <CustomerListHeader />
        <TableBody>
          {customers.map((customer: any) => (
            <CustomerListItem 
              key={customer.id} 
              customer={customer} 
              isCitiesLoading={isCitiesLoading}
              cities={cities}
              handleRoleUpdate={handleRoleUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerList;
