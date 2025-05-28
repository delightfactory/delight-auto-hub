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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminBannersPage: React.FC = () => {
  const { data: banners = [], isLoading, refetch } = useQuery<Banner[], Error>({
    queryKey: ['admin-banners'],
    queryFn: bannerService.getAllBanners,
  });
  const { toast } = useToast();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string>("");
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
    setFormDialogOpen(true);
  };

  const confirmDeleteBanner = (id: string) => {
    setBannerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await bannerService.deleteBanner(bannerToDelete);
      toast({ title: 'تم حذف البنر بنجاح' });
      refetch();
      setDeleteDialogOpen(false);
      setBannerToDelete("");
    } catch (error) {
      toast({ title: 'خطأ في الحذف', description: 'حدث خطأ أثناء محاولة حذف البنر', variant: 'destructive' });
    }
  };

  const onSubmit = async (data: Partial<Banner>) => {
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, data);
        toast({ title: 'تم تحديث البنر', description: 'تم تحديث البنر بنجاح' });
      } else {
        await bannerService.createBanner(data);
        toast({ title: 'تم إنشاء البنر', description: 'تم إنشاء البنر بنجاح' });
      }
      setFormDialogOpen(false);
      setEditingBanner(null);
      refetch();
    } catch (error) {
      toast({ title: 'خطأ في العملية', description: 'حدث خطأ أثناء محاولة حفظ البنر', variant: 'destructive' });
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة البنرات</h1>
        <Button onClick={() => { setEditingBanner(null); setFormDialogOpen(true); }}>
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
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => confirmDeleteBanner(b.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>لا توجد بنرات بعد</p>
          )}

      {/* حوار إضافة/تعديل البنر */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'تعديل البنر' : 'إضافة بنر جديد'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'قم بتعديل بيانات البنر هنا' : 'قم بإدخال بيانات البنر الجديد هنا'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BannerForm
              initialData={editingBanner}
              onSubmit={onSubmit}
              onCancel={() => { setFormDialogOpen(false); setEditingBanner(null); }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف البنر؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBannerToDelete("")}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBannersPage;
