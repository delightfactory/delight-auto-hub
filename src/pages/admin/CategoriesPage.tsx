import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  FileX,
  Tag,
  ShoppingCart,
  Heart,
  Star,
  Truck,
  TagsIcon,
  ImageIcon
} from 'lucide-react';
import { categoryService } from '@/services/adminService';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

// مخطط التحقق من صحة الفئة
const categorySchema = z.object({
  name: z.string().min(2, "اسم الفئة مطلوب ويجب أن يتكون من حرفين على الأقل"),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoriesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  
  const {
    data: categories = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryService.getCategories
  });
  
  // نموذج إضافة/تعديل الفئة
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: null,
      parent_id: null,
      icon: null,
    }
  });
  
  // تهيئة النموذج عند التعديل
  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      image: category.image,
      parent_id: category.parent_id,
      icon: category.icon,
    });
    setIsDialogOpen(true);
  };
  
  // إضافة فئة جديدة
  const handleAddNewCategory = () => {
    setEditingCategory(null);
    form.reset({
      name: '',
      description: '',
      image: null,
      parent_id: null,
      icon: null,
    });
    setIsDialogOpen(true);
  };
  
  // حذف فئة
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      toast({
        title: "تم حذف الفئة",
        description: "تم حذف الفئة بنجاح"
      });
      refetch();
    } catch (error) {
      console.error("خطأ في حذف الفئة:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف الفئة",
        variant: "destructive"
      });
    }
  };
  
  // حفظ الفئة
  const handleFormSubmit = async (data: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
        toast({
          title: "تم تحديث الفئة",
          description: "تم تحديث الفئة بنجاح"
        });
      } else {
        await categoryService.createCategory(data);
        toast({
          title: "تم إضافة الفئة",
          description: "تم إضافة الفئة الجديدة بنجاح"
        });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("خطأ في حفظ الفئة:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ الفئة",
        variant: "destructive"
      });
    }
  };
  
  // رفع صورة الفئة
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      // إنشاء اسم ملف فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;
      
      // رفع الملف إلى Storage
      const { data, error } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // إنشاء عنوان URL للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);
      
      // تعيين صورة الفئة
      form.setValue('image', publicUrl);
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الفئة بنجاح"
      });
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء محاولة رفع الصورة",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  // حذف صورة الفئة
  const handleRemoveImage = () => {
    form.setValue('image', null);
  };
  
  // رفع أيقونة الفئة
  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingIcon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2,15)}_${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;
      const { data, error } = await supabase.storage.from('category-icons').upload(filePath, file);
      if (error) throw error;
      // البوكت عام، استخدم الرابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('category-icons')
        .getPublicUrl(filePath);
      form.setValue('icon', publicUrl);
      toast({ title: 'تم رفع الأيقونة', description: 'تم رفع أيقونة الفئة بنجاح' });
    } catch (error) {
      console.error('خطأ في رفع الأيقونة:', error);
      toast({ title: 'خطأ في رفع الأيقونة', description: 'حدث خطأ أثناء رفع الأيقونة', variant: 'destructive' });
    } finally {
      setUploadingIcon(false);
    }
  };
  const handleRemoveIcon = () => form.setValue('icon', null);
  
  // تصفية الفئات بناءً على مصطلح البحث
  const filteredCategories = searchTerm
    ? categories.filter((category: any) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">الفئات</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن فئة..."
              className="pr-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddNewCategory}>
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>إضافة فئة</span>
          </Button>
        </div>
      </div>
      
      {/* جدول الفئات */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
          <p className="text-lg font-medium">جارِ تحميل الفئات...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الفئة الأب</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category: any) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <TagsIcon size={16} className="text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {category.description || "لا يوجد وصف"}
                </TableCell>
                <TableCell>
                  {categories.find((c: any) => c.id === category.parent_id)?.name || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف الفئة؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الفئة نهائياً من قاعدة البيانات.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            حذف
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
      ) : (
        <div className="py-24 text-center">
          <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {searchTerm ? "لا يوجد فئات مطابقة" : "لا يوجد فئات"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm
              ? "لم نتمكن من العثور على فئات تطابق عملية البحث"
              : "لم يتم إضافة أي فئات بعد"}
          </p>
          <Button onClick={handleAddNewCategory}>
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>إضافة فئة جديدة</span>
          </Button>
        </div>
      )}
      
      {/* نافذة إضافة/تعديل الفئة */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'قم بتعديل بيانات الفئة الحالية' 
                : 'أدخل بيانات الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفئة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الفئة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الفئة</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل وصفاً للفئة (اختياري)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة الأب</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      >
                        <option value="">لا يوجد فئة أب</option>
                        {categories
                          .filter((c: any) => c.id !== editingCategory?.id) // استبعاد الفئة نفسها من القائمة
                          .map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                        }
                      </select>
                    </FormControl>
                    <FormDescription>
                      اختياري: يمكنك تحديد فئة أب لهذه الفئة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صورة الفئة</FormLabel>
                    <FormControl>
                      <div>
                        {field.value ? (
                          <div className="relative border rounded-lg overflow-hidden mb-2">
                            <img 
                              src={field.value} 
                              alt="صورة الفئة" 
                              className="w-full h-32 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 left-2"
                              onClick={handleRemoveImage}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                              <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        )}
                        {uploading && <p className="text-xs text-center mt-1">جارِ الرفع...</p>}
                      </div>
                    </FormControl>
                    <FormDescription>
                      اختياري: يمكنك إضافة صورة للفئة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أيقونة الفئة</FormLabel>
                    <FormControl>
                      <div>
                        {field.value ? (
                          <div className="relative border rounded-lg overflow-hidden mb-2">
                            <img
                              src={field.value}
                              alt="أيقونة الفئة"
                              className="w-16 h-16 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 left-2"
                              onClick={handleRemoveIcon}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                              <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="text-sm text-gray-500">اضغط لرفع أيقونة</p>
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleIconUpload}
                                disabled={uploadingIcon}
                              />
                            </label>
                          </div>
                        )}
                        {uploadingIcon && <p className="text-xs text-center mt-1">جارِ رفع الأيقونة...</p>}
                      </div>
                    </FormControl>
                    <FormDescription>اختياري: يمكنك إضافة أيقونة مخصصة للفئة</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
