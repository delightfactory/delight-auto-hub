
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  FileX,
  Eye,
  FileEdit
} from 'lucide-react';
import { articleService } from '@/services/adminService';
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
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import ArticleForm from '@/components/admin/ArticleForm';

const ArticlesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  
  const {
    data: articles = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: articleService.getArticles
  });
  
  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setShowForm(true);
  };
  
  const handleDeleteArticle = async (id: string) => {
    try {
      await articleService.deleteArticle(id);
      toast({
        title: "تم حذف المقالة",
        description: "تم حذف المقالة بنجاح"
      });
      refetch();
    } catch (error) {
      console.error("خطأ في حذف المقالة:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف المقالة",
        variant: "destructive"
      });
    }
  };
  
  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await articleService.toggleArticlePublished(id, !currentStatus);
      toast({
        title: currentStatus ? "تم إلغاء نشر المقالة" : "تم نشر المقالة",
        description: currentStatus ? "تم إلغاء نشر المقالة بنجاح" : "تم نشر المقالة بنجاح"
      });
      refetch();
    } catch (error) {
      console.error("خطأ في تغيير حالة النشر:", error);
      toast({
        title: "خطأ في تغيير الحالة",
        description: "حدث خطأ أثناء محاولة تغيير حالة النشر",
        variant: "destructive"
      });
    }
  };
  
  const handleFormSubmit = async (articleData: any) => {
    try {
      if (editingArticle) {
        await articleService.updateArticle(editingArticle.id, articleData);
        toast({
          title: "تم تحديث المقالة",
          description: "تم تحديث بيانات المقالة بنجاح"
        });
      } else {
        await articleService.createArticle(articleData);
        toast({
          title: "تم إضافة المقالة",
          description: "تم إضافة المقالة الجديدة بنجاح"
        });
      }
      setShowForm(false);
      setEditingArticle(null);
      refetch();
    } catch (error) {
      console.error("خطأ في حفظ المقالة:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ المقالة",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير منشور';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // تصفية المقالات بناءً على مصطلح البحث
  const filteredArticles = searchTerm
    ? articles.filter((article: any) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : articles;

  return (
    <div className="space-y-6">
      {showForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {editingArticle ? 'تعديل مقالة' : 'إضافة مقالة جديدة'}
            </h1>
            <Button variant="ghost" onClick={() => {
              setShowForm(false);
              setEditingArticle(null);
            }}>
              العودة إلى قائمة المقالات
            </Button>
          </div>
          <ArticleForm 
            initialData={editingArticle} 
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingArticle(null);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">المقالات</h1>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مقالة..."
                  className="pr-10 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مقالة</span>
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
              <p className="text-lg font-medium">جارِ تحميل المقالات...</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">الصورة</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الملخص</TableHead>
                  <TableHead>الكاتب</TableHead>
                  <TableHead>تاريخ النشر</TableHead>
                  <TableHead>منشور</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article: any) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.cover_image ? (
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <FileEdit size={16} className="text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {article.excerpt || "لا يوجد ملخص"}
                    </TableCell>
                    <TableCell>{article.author?.name || "غير معروف"}</TableCell>
                    <TableCell>
                      {formatDate(article.published_at)}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={article.published}
                        onCheckedChange={() => handleTogglePublished(article.id, article.published)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={`/articles/${article.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف المقالة؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المقالة نهائياً من قاعدة البيانات.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteArticle(article.id)}
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
                {searchTerm ? "لا يوجد مقالات مطابقة" : "لا يوجد مقالات"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "لم نتمكن من العثور على مقالات تطابق عملية البحث"
                  : "لم يتم إضافة أي مقالات بعد"}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مقالة جديدة</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesPage;
