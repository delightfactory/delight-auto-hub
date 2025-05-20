
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Info, Pencil, Plus, X, Image as ImageIcon, 
  Check, PackageCheck, Tag, CircleDollarSign 
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { categoryService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

// مخطط التحقق من صحة المنتج
const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب ويجب أن يتكون من حرفين على الأقل"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "يجب أن يكون السعر عددًا موجبًا"),
  discount_price: z.coerce.number().min(0, "يجب أن يكون سعر الخصم عددًا موجبًا").optional().nullable(),
  stock: z.coerce.number().min(0, "يجب أن تكون الكمية عددًا موجبًا").optional().nullable(),
  category: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // تهيئة نموذج المنتج
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      discount_price: initialData?.discount_price || null,
      stock: initialData?.stock || 0,
      category: initialData?.category || null,
      is_featured: initialData?.is_featured || false,
      is_new: initialData?.is_new || false,
      features: initialData?.features || [],
      images: initialData?.images || [],
    }
  });
  
  // جلب الفئات عند تحميل النموذج
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("خطأ في جلب الفئات:", error);
        toast({
          title: "خطأ في جلب الفئات",
          description: "لم نتمكن من جلب قائمة الفئات",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // إضافة ميزة جديدة
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', [...currentFeatures, newFeature]);
    setNewFeature('');
  };
  
  // حذف ميزة
  const handleRemoveFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', currentFeatures.filter((_, i) => i !== index));
  };
  
  // رفع الصور
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      // إنشاء اسم ملف فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // رفع الملف إلى Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // إنشاء عنوان URL للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      // إضافة الصورة إلى المنتج
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, publicUrl]);
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح"
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
  
  // حذف صورة
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues('images') || [];
    form.setValue('images', currentImages.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* معلومات المنتج الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Info className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">معلومات المنتج الأساسية</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المنتج</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسم المنتج" {...field} />
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
                        <FormLabel>وصف المنتج</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل وصف المنتج"
                            className="min-h-32"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-500">
                                ر.س
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discount_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر الخصم (اختياري)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : null;
                                  field.onChange(val);
                                }}
                                value={field.value === null ? '' : field.value}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-500">
                                ر.س
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكمية المتاحة</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفئة</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            >
                              <option value="">اختر الفئة</option>
                              {loadingCategories ? (
                                <option disabled>جارِ تحميل الفئات...</option>
                              ) : (
                                categories.map((category) => (
                                  <option key={category.id} value={category.name}>
                                    {category.name}
                                  </option>
                                ))
                              )}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* ميزات المنتج */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Check className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">ميزات المنتج</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف ميزة جديدة"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddFeature}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    {form.watch('features')?.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                        <span>{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    {(!form.watch('features') || form.watch('features').length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        لم تتم إضافة أي ميزات بعد
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* صور المنتج */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <ImageIcon className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">صور المنتج</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {/* زر إضافة صورة */}
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Plus className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          أضف صورة
                        </p>
                      </div>
                      <Input
                        id="dropzone-file"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <p className="text-xs text-center mt-2">جارِ الرفع...</p>}
                  </div>
                  
                  {/* عرض الصور المرفوعة */}
                  {form.watch('images')?.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`صورة المنتج ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {(!form.watch('images') || form.watch('images').length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4 mt-4">
                    لم تتم إضافة أي صور بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* الجانب الأيمن - خيارات إضافية */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">خيارات إضافية</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm rtl:space-x-reverse">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منتج مميز</FormLabel>
                          <FormDescription>
                            تمييز هذا المنتج يعني عرضه في الصفحة الرئيسية
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_new"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm rtl:space-x-reverse">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منتج جديد</FormLabel>
                          <FormDescription>
                            سيتم وضع علامة "جديد" على المنتج
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <PackageCheck className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">معاينة المنتج</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-md overflow-hidden shadow-sm border">
                  {form.watch('images') && form.watch('images').length > 0 ? (
                    <img
                      src={form.watch('images')[0]}
                      alt="معاينة المنتج"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <h3 className="text-lg font-semibold">
                      {form.watch('name') || 'اسم المنتج'}
                    </h3>
                    
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {form.watch('description') || 'وصف المنتج سيظهر هنا...'}
                    </p>
                    
                    <div className="mt-3 flex items-center">
                      {form.watch('discount_price') ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            {form.watch('discount_price')} ر.س
                          </span>
                          <span className="mr-2 text-sm text-gray-400 line-through">
                            {form.watch('price')} ر.س
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">
                          {form.watch('price')} ر.س
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {form.watch('is_featured') && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                            مميز
                          </span>
                        )}
                        {form.watch('is_new') && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            جديد
                          </span>
                        )}
                        {form.watch('category') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {form.watch('category')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" className="px-6">
            {initialData ? 'تحديث المنتج' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
