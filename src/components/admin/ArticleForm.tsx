
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Info, FileText, FileEdit, Image as ImageIcon, 
  Save, CheckCircle, X, Globe
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// مخطط التحقق من صحة المقالة
const articleSchema = z.object({
  title: z.string().min(2, "عنوان المقالة مطلوب ويجب أن يتكون من حرفين على الأقل"),
  slug: z.string().min(2, "الرابط المختصر مطلوب").regex(/^[a-z0-9-]+$/, "يجب أن يحتوي الرابط على أحرف إنجليزية صغيرة وأرقام وعلامات شرطة فقط"),
  content: z.string().min(10, "محتوى المقالة مطلوب ويجب أن يتكون من 10 أحرف على الأقل"),
  excerpt: z.string().optional(),
  cover_image: z.string().optional().nullable(),
  published: z.boolean().default(false)
});

// Extended schema with additional fields for database operations
const extendedArticleSchema = articleSchema.extend({
  author_id: z.string().uuid().optional(),
  published_at: z.string().optional().nullable()
});

type ArticleFormValues = z.infer<typeof articleSchema>;
type ExtendedArticleFormValues = z.infer<typeof extendedArticleSchema>;

interface ArticleFormProps {
  initialData?: any;
  onSubmit: (data: ExtendedArticleFormValues) => Promise<void>;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [articlePreview, setArticlePreview] = useState('');
  
  // تهيئة نموذج المقالة
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      cover_image: initialData?.cover_image || null,
      published: initialData?.published || false
    }
  });
  
  // تحديث معاينة المقالة عند تغيير المحتوى
  useEffect(() => {
    // يمكن تحسين هذا المكون باستخدام مكتبة مثل Markdown لمعالجة النص
    setArticlePreview(form.watch('content') || '');
  }, [form.watch('content')]);
  
  // توليد الرابط المختصر من العنوان
  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // إزالة الأحرف الخاصة
      .replace(/\s+/g, '-') // استبدال الفراغات بعلامات شرطة
      .replace(/--+/g, '-') // تجنب الشرطات المتكررة
      .trim();
      
    form.setValue('slug', slug);
  };
  
  // رفع صورة الغلاف
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      // إنشاء اسم ملف فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `articles/${fileName}`;
      
      // رفع الملف إلى Storage
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // إنشاء عنوان URL للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);
      
      // تعيين صورة الغلاف
      form.setValue('cover_image', publicUrl);
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الغلاف بنجاح"
      });
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء محاولة رفع صورة الغلاف",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  // حذف صورة الغلاف
  const handleRemoveImage = () => {
    form.setValue('cover_image', null);
  };
  
  // التحضير للإرسال
  const handleFormSubmit = (data: ArticleFormValues) => {
    // Prepare the extended data with additional fields
    const extendedData: ExtendedArticleFormValues = {
      ...data
    };

    // إضافة معرف المؤلف إذا كان المقالة جديدة
    if (!initialData && user) {
      extendedData.author_id = user.id;
    }
    
    // Handle published_at date
    if (data.published) {
      extendedData.published_at = initialData && initialData.published 
        ? initialData.published_at 
        : new Date().toISOString();
    } else {
      extendedData.published_at = null;
    }

    onSubmit(extendedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* معلومات المقالة الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Info className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">معلومات المقالة الأساسية</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المقالة</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل عنوان المقالة" 
                            {...field} 
                            onBlur={() => {
                              // توليد الرابط المختصر تلقائياً إذا لم يكن موجوداً
                              if (!form.getValues('slug')) {
                                generateSlug();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرابط المختصر</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="مثال: my-article-title" 
                              {...field}
                              value={field.value || ''}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateSlug}
                              className="flex-shrink-0"
                              disabled={!form.getValues('title')}
                            >
                              توليد تلقائي
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          سيظهر هذا الرابط في عنوان المقالة: /articles/{form.watch('slug') || 'example-slug'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملخص المقالة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل ملخصاً قصيراً للمقالة"
                            className="min-h-16"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          الملخص هو وصف مختصر يظهر في صفحة قائمة المقالات
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>محتوى المقالة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل محتوى المقالة الكامل هنا..."
                            className="min-h-[400px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* صورة الغلاف */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <ImageIcon className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">صورة الغلاف</h2>
                </div>
                
                <Separator className="my-4" />
                
                {form.watch('cover_image') ? (
                  <div className="space-y-4">
                    <div className="relative border rounded-lg overflow-hidden">
                      <img 
                        src={form.watch('cover_image')!} 
                        alt="صورة الغلاف" 
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 left-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                        إزالة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          اضغط لرفع صورة الغلاف
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG (الحد الأقصى: 5 ميجابايت)
                        </p>
                      </div>
                      <Input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <p className="text-xs text-center mt-2">جارِ الرفع...</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* الجانب الأيمن - خيارات النشر والمعاينة */}
          <div className="space-y-6">
            {/* حالة النشر */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">خيارات النشر</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            نشر المقالة
                          </FormLabel>
                          <FormDescription>
                            {field.value
                              ? "المقالة منشورة وظاهرة للجمهور"
                              : "المقالة مسودة وغير ظاهرة للجمهور"}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    تاريخ الإنشاء: {initialData ? formatDate(initialData.created_at) : "الآن"}
                  </p>
                  {initialData && initialData.published_at && (
                    <p className="text-sm text-gray-500">
                      تاريخ النشر: {formatDate(initialData.published_at)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* معاينة المقالة */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 ml-2 text-gray-500" />
                  <h2 className="text-lg font-medium">معاينة المقالة</h2>
                </div>
                
                <Separator className="my-4" />
                
                <div className="border rounded-lg overflow-hidden">
                  {/* صورة الغلاف */}
                  {form.watch('cover_image') ? (
                    <div className="w-full h-32 bg-gray-100">
                      <img 
                        src={form.watch('cover_image')!} 
                        alt="معاينة المقالة" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <FileEdit className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  
                  {/* محتوى المقالة */}
                  <div className="p-4 bg-white dark:bg-gray-900">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold line-clamp-2">
                        {form.watch('title') || 'عنوان المقالة'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {form.watch('excerpt') || form.watch('content') || 'محتوى المقالة...'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">
                          بواسطة: {user?.name || 'مؤلف'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {initialData ? formatDate(initialData.created_at) : new Date().toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* رابط المقالة */}
            {initialData && initialData.published && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 ml-2 text-gray-500" />
                    <h2 className="text-lg font-medium">رابط المقالة</h2>
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={`/articles/${initialData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm block truncate"
                    >
                      {window.location.origin}/articles/{initialData.slug}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" className="px-6">
            <Save className="ml-2 h-4 w-4" />
            {initialData ? 'حفظ التغييرات' : 'نشر المقالة'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// تنسيق التاريخ
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default ArticleForm;
