import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CircleCheck, 
  CircleAlert, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileText,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, orderService } from '@/services/adminService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'processing':
        return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد المعالجة';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-lg font-medium">جارِ تحميل الإحصائيات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">لوحة القيادة</h1>
        <p className="text-gray-500 dark:text-gray-400">
          مرحباً بك في لوحة تحكم ديلايت
        </p>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-r-4 border-r-blue-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي الطلبات</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.ordersCount}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-r-4 border-r-green-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي المنتجات</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.productsCount}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-r-4 border-r-purple-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي العملاء</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.customersCount}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-r-4 border-r-amber-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">متوسط الطلب</p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats?.ordersCount && stats.ordersCount > 0 ? (
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(stats.averageOrder)
                  ) : (
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(0)
                  )}
                </h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">أحدث الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer?.name || 'غير متاح'}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(order.total_amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <CircleAlert className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 dark:text-gray-400">ستظهر أحدث الطلبات هنا بمجرد وصولها</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/products">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
                <Package className="h-6 w-6 mb-2" />
                <span>إضافة منتج جديد</span>
              </Button>
            </Link>
            <Link to="/admin/articles">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
                <FileText className="h-6 w-6 mb-2" />
                <span>إضافة مقالة جديدة</span>
              </Button>
            </Link>
            <Link to="/admin/categories">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
                <Tag className="h-6 w-6 mb-2" />
                <span>إضافة فئة جديدة</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
