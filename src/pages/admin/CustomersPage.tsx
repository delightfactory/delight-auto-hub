
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Loader2, 
  FileX, 
  User,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  Crown,
  UserCog
} from 'lucide-react';
import { customerService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const CustomersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: customers = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: customerService.getCustomers
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // تصفية العملاء بناءً على مصطلح البحث
  const filteredCustomers = searchTerm
    ? customers.filter((customer: any) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
          <p className="text-lg font-medium">جارِ تحميل العملاء...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">الصورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الصلاحية</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={customer.avatar_url} />
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {customer.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 ml-1 text-gray-500" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {customer.phone ? (
                        <>
                          <Phone className="h-4 w-4 ml-1 text-gray-500" />
                          {customer.phone}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.city ? (
                      <Badge variant="outline" className="font-normal">
                        {customer.city}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(customer.created_at)}</TableCell>
                  <TableCell>
                    {customer.role === 'admin' ? (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                        <Crown className="w-3 h-3 ml-1" />
                        مسؤول
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                        <User className="w-3 h-3 ml-1" />
                        عميل
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Fixed: Using Link component correctly with Button */}
                      <Link to={`/admin/orders?customer=${customer.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200"
                        >
                          <ShoppingBag className="h-4 w-4 ml-1" />
                          <span>الطلبات</span>
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={customer.role === 'admin' ? 'text-gray-600' : 'text-red-600 border-red-200'}
                          >
                            <Shield className="h-4 w-4 ml-1" />
                            <span>
                              {customer.role === 'admin' ? 'إلغاء الإدارة' : 'ترقية لمسؤول'}
                            </span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {customer.role === 'admin' 
                                ? 'هل أنت متأكد من إلغاء صلاحيات المسؤول؟' 
                                : 'هل أنت متأكد من ترقية المستخدم؟'
                              }
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {customer.role === 'admin' 
                                ? 'سيتم إلغاء صلاحيات المسؤول لهذا المستخدم ولن يتمكن من الوصول إلى لوحة التحكم.' 
                                : 'سيتمكن هذا المستخدم من الوصول إلى لوحة التحكم وإدارة الموقع بالكامل.'
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              className={customer.role === 'admin' ? 'bg-gray-600' : 'bg-red-600'}
                              onClick={() => handleRoleUpdate(
                                customer.id, 
                                customer.role === 'admin' ? 'customer' : 'admin'
                              )}
                            >
                              {customer.role === 'admin' ? 'إلغاء الإدارة' : 'ترقية'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default CustomersPage;
