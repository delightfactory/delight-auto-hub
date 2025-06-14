import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShoppingBag, Crown, User, Mail, Phone, Loader2 } from 'lucide-react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatDate, translateRole } from '@/lib/utils';
import type { City } from '@/types/db';

interface CustomerListItemProps {
  customer: any;
  isCitiesLoading: boolean;
  cities: City[];
  handleRoleUpdate: (id: string, role: 'admin' | 'customer') => Promise<void>;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, isCitiesLoading, cities, handleRoleUpdate }) => {
  // إضافة حالة للتحكم في فتح/إغلاق الحوار
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // معالجة تحديث دور المستخدم مع إغلاق الحوار
  const handleRoleUpdateAndClose = async () => {
    await handleRoleUpdate(
      customer.id, 
      customer.role === 'admin' ? 'customer' : 'admin'
    );
    setDialogOpen(false);
  };

  const cityName = !isCitiesLoading && customer.city
    ? cities.find(c => c.id === customer.city)?.name_ar || null
    : null;

  return (
    <TableRow>
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
        {isCitiesLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        ) : cityName ? (
          <Badge variant="outline" className="font-normal">
            {cityName}
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
          
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={customer.role === 'admin' ? 'text-gray-600' : 'text-red-600 border-red-200'}
                onClick={() => setDialogOpen(true)}
              >
                <Shield className="h-4 w-4 ml-1" />
                <span>
                  {customer.role === 'admin' ? 'إلغاء الإدارة' : 'ترقية لمسؤول'}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-[100]">
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
                <AlertDialogCancel onClick={() => setDialogOpen(false)}>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  className={customer.role === 'admin' ? 'bg-gray-600' : 'bg-red-600'}
                  onClick={handleRoleUpdateAndClose}
                >
                  {customer.role === 'admin' ? 'إلغاء الإدارة' : 'ترقية'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerListItem;
