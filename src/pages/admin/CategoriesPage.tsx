import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { categoryService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  parent_id: z.string().nullable(),
  is_active: z.boolean().default(true),
});

const CategoriesPage = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryService.getAllCategories,  // Use getAllCategories instead of getCategories
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { mutate: createCategory, isLoading: isCreateLoading } = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      await categoryService.createCategory(values);
    },
    {
      onSuccess: () => {
        toast({
          title: "تم إنشاء الفئة",
          description: "تم إنشاء الفئة بنجاح"
        });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        setIsFormOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "خطأ في إنشاء الفئة",
          description: "حدث خطأ أثناء محاولة إنشاء الفئة",
          variant: "destructive"
        });
      },
    }
  );

  const { mutate: updateCategory, isLoading: isUpdateLoading } = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      if (!editingCategory) return;
      await categoryService.updateCategory(editingCategory.id, values);
    },
    {
      onSuccess: () => {
        toast({
          title: "تم تحديث الفئة",
          description: "تم تحديث الفئة بنجاح"
        });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        setIsFormOpen(false);
        setEditingCategory(null);
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "خطأ في تحديث الفئة",
          description: "حدث خطأ أثناء محاولة تحديث الفئة",
          variant: "destructive"
        });
      },
    }
  );

  const { mutate: deleteCategory, isLoading: isDeleteLoading } = useMutation(
    async (id: string) => {
      await categoryService.deleteCategory(id);
    },
    {
      onSuccess: () => {
        toast({
          title: "تم حذف الفئة",
          description: "تم حذف الفئة بنجاح"
        });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      },
      onError: (error) => {
        toast({
          title: "خطأ في حذف الفئة",
          description: "حدث خطأ أثناء محاولة حذف الفئة",
          variant: "destructive"
        });
      },
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: null,
      is_active: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
      updateCategory(values);
    } else {
      createCategory(values);
    }
  };

  // For the filter:
  const filteredCategories = searchTerm && categories
    ? categories.filter((category: any) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : categories;

  const CategoryRow = ({ category }: { category: any }) => {
    const parentId = category.parent_id;

    // For the find:
    const parentCategory = parentId && categories
      ? categories.find((cat: any) => cat.id === parentId)
      : null;

    return (
      <TableRow key={category.id}>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell>{category.description}</TableCell>
        <TableCell>{parentCategory ? parentCategory.name : 'لا يوجد'}</TableCell>
        <TableCell>
          <Label htmlFor={`category-active-${category.id}`} className="sr-only">
            {category.is_active ? 'Active' : 'Inactive'}
          </Label>
          <Switch
            id={`category-active-${category.id}`}
            checked={category.is_active}
            onCheckedChange={(checked) => {
              categoryService.updateCategory(category.id, { is_active: checked });
              refetch();
            }}
          />
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingCategory(category);
              form.reset({
                name: category.name,
                description: category.description,
                parent_id: category.parent_id,
                is_active: category.is_active,
              });
              setIsFormOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            تعديل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCategory(category.id)}
            disabled={isDeleteLoading}
          >
            {isDeleteLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحذف
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                حذف
              </>
            )}
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">الفئات</h1>
        <div className="flex gap-4">
          <Button onClick={() => { setEditingCategory(null); setIsFormOpen(true); form.reset() }}>
            <Plus className="mr-2 h-4 w-4" /> إضافة فئة
          </Button>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن فئة..."
              className="pr-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <p className="text-sm text-gray-500">جاري تحميل الفئات...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الفئة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الفئة الرئيسية</TableHead>
                <TableHead>نشط</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories && filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) => (
                  <CategoryRow key={category.id} category={category} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    لا توجد فئات مطابقة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* New/Edit Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'قم بتحرير معلومات الفئة في النموذج أدناه.'
                : 'أدخل معلومات الفئة الجديدة في النموذج أدناه.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفئة</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الفئة" {...field} />
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
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Input placeholder="الوصف" {...field} />
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
                    <FormLabel>الفئة الرئيسية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة الرئيسية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={null}>لا يوجد</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>نشط</FormLabel>
                      <FormDescription>
                        تفعيل أو تعطيل الفئة
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isCreateLoading || isUpdateLoading}>
                  {isCreateLoading || isUpdateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ ...
                    </>
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
