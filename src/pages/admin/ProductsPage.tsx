
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  FileX,
  PackageX
} from 'lucide-react';
import { productService } from '@/services/adminService';
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
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/admin/ProductForm';

const ProductsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const {
    data: products = [],
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: productService.getProducts,
    retry: 3,
    retryDelay: 1000
  });
  
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح"
      });
      refetch();
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف المنتج",
        variant: "destructive"
      });
    }
  };
  
  const handleFormSubmit = async (productData: any) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        toast({
          title: "تم تحديث المنتج",
          description: "تم تحديث بيانات المنتج بنجاح"
        });
      } else {
        await productService.createProduct(productData);
        toast({
          title: "تم إضافة المنتج",
          description: "تم إضافة المنتج الجديد بنجاح"
        });
      }
      setShowForm(false);
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error("خطأ في حفظ المنتج:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ المنتج",
        variant: "destructive"
      });
    }
  };
  
  // تصفية المنتجات بناءً على مصطلح البحث
  const filteredProducts = searchTerm
    ? products.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // في حالة حدوث خطأ في تحميل البيانات
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>إضافة منتج</span>
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FileX className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            خطأ في تحميل المنتجات
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            حدث خطأ أثناء محاولة تحميل قائمة المنتجات
          </p>
          <Button onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h1>
            <Button variant="ghost" onClick={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}>
              العودة إلى قائمة المنتجات
            </Button>
          </div>
          <ProductForm 
            initialData={editingProduct} 
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">المنتجات</h1>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن منتج..."
                  className="pr-10 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة منتج</span>
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
              <p className="text-lg font-medium">جارِ تحميل المنتجات...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <PackageX size={16} className="text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {product.description || "لا يوجد وصف"}
                      </TableCell>
                      <TableCell>
                        {product.discount_price ? (
                          <div>
                            <span className="text-red-600 font-medium">{product.discount_price} جنيه</span>
                            <span className="text-gray-400 line-through text-xs mr-2">
                              {product.price} جنيه
                            </span>
                          </div>
                        ) : (
                          <span>{product.price} جنيه</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.stock > 0 ? (
                          <span className="text-green-600 font-medium">{product.stock}</span>
                        ) : (
                          <span className="text-red-600">نفذت الكمية</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50">
                              مميز
                            </Badge>
                          )}
                          {product.is_new && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-50">
                              جديد
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
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
                                <AlertDialogTitle>هل أنت متأكد من حذف المنتج؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج نهائياً من قاعدة البيانات.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteProduct(product.id)}
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
            </div>
          ) : (
            <div className="py-24 text-center">
              <FileX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {searchTerm ? "لا يوجد منتجات مطابقة" : "لا يوجد منتجات"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "لم نتمكن من العثور على منتجات تطابق عملية البحث"
                  : "لم يتم إضافة أي منتجات بعد"}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة منتج جديد</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
