import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileDown, FileUp } from 'lucide-react';
import { productService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductForm from '@/components/admin/ProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: products = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: productService.getAllProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const handleCreateProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      toast({
        title: "تم إنشاء المنتج",
        description: "تم إنشاء المنتج بنجاح"
      });
      setIsFormOpen(false);
      refetch();
      return Promise.resolve();
    } catch (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      toast({
        title: "خطأ في إنشاء المنتج",
        description: "حدث خطأ أثناء محاولة إنشاء المنتج",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };
  
  const handleUpdateProduct = async (productData: any) => {
    try {
      await productService.updateProduct(editingProduct.id, productData);
      toast({
        title: "تم تحديث المنتج",
        description: "تم تحديث المنتج بنجاح"
      });
      setIsFormOpen(false);
      setEditingProduct(null);
      refetch();
      return Promise.resolve();
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      toast({
        title: "خطأ في تحديث المنتج",
        description: "حدث خطأ أثناء محاولة تحديث المنتج",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };
  
  // تصفية المنتجات بناءً على مصطلح البحث
  const filteredProducts = searchTerm && products
    ? products.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <div className="flex gap-4">
          <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> إضافة منتج
          </Button>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن منتج..."
              className="pr-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <div key={product.id} className="border rounded-md p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">Code: {product.product_code}</p>
              <div className="mt-2 flex justify-between items-center">
                <span>{product.price} ر.س</span>
                <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}>
                  تعديل
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex justify-center">
            <p>No products found.</p>
          </div>
        )}
      </div>
      
      {/* New/Edit Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'قم بتحرير معلومات المنتج في النموذج أدناه.'
                : 'أدخل معلومات المنتج الجديد في النموذج أدناه.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
