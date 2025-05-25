import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Banner } from '@/types/db';
import { bannerService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import BannerForm from '@/components/admin/BannerForm';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const AdminBannersPage: React.FC = () => {
  const { data: banners = [], isLoading, refetch } = useQuery<Banner[], Error>({
    queryKey: ['admin-banners'],
    queryFn: bannerService.getAllBanners,
  });
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // خريطة لعرض تسميات الصفحات
  const pageLabels: Record<string, string> = {
    home: 'الرئيسية',
    products: 'المنتجات',
    product: 'تفاصيل المنتج',
    'best-deals': 'أفضل العروض',
    articles: 'المقالات',
    article: 'تفاصيل المقالة',
    factory: 'المصنع',
    about: 'عن الشركة',
    contact: 'اتصل بنا',
    profile: 'الملف الشخصي',
    checkout: 'سلة التسوق',
    orders: 'تتبع الطلبات',
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await bannerService.deleteBanner(id);
      toast({ title: 'تم حذف البنر' });
      refetch();
    } catch (error) {
      toast({ title: 'خطأ في الحذف', variant: 'destructive' });
    }
  };

  const onSubmit = async (data: Partial<Banner>) => {
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, data);
        toast({ title: 'تم تحديث البنر' });
      } else {
        await bannerService.createBanner(data);
        toast({ title: 'تم إنشاء البنر' });
      }
      setShowForm(false);
      setEditingBanner(null);
      refetch();
    } catch (error) {
      toast({ title: 'خطأ في العملية', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">إدارة البنرات</h1>
            <Button onClick={() => { setEditingBanner(null); setShowForm(true); }}>
              <PlusCircle className="h-5 w-5 ml-1" />
              <span>إضافة بنر</span>
            </Button>
          </div>
          {banners.length > 0 ? (
            <div className="overflow-auto bg-white shadow rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الترتيب</TableHead>
                    <TableHead>الصفحات</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <img src={b.image_url} alt={b.title} className="h-10 w-20 object-cover rounded" />
                      </TableCell>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>{b.is_active ? 'مفعل' : 'معطل'}</TableCell>
                      <TableCell>{b.display_order}</TableCell>
                      <TableCell>
                        {b.pages.map(p => (
                          <span key={p} className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2 py-0.5 rounded-full">
                            {pageLabels[p] || p}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>لا توجد بنرات بعد</p>
          )}
        </>
      ) : (
        <div>
          <Button variant="ghost" onClick={() => { setShowForm(false); setEditingBanner(null); }}>
            العودة إلى القائمة
          </Button>
          <BannerForm
            initialData={editingBanner}
            onSubmit={onSubmit}
            onCancel={() => { setShowForm(false); setEditingBanner(null); }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
