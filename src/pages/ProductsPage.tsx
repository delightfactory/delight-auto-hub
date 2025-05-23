
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import { ProductDataService } from '@/services/productDataService';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // جلب جميع المنتجات من Supabase
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts
  });

  // تطبيق الفلترة عند تغيير البحث أو المنتجات
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  if (error) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">حدث خطأ في تحميل المنتجات</h2>
          <p className="text-gray-600 mb-8">يرجى المحاولة مرة أخرى لاحقاً</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="منتجاتنا" 
        subtitle="اكتشف مجموعتنا الواسعة من منتجات العناية بالسيارات عالية الجودة"
      />
      
      <section className="py-16">
        <div className="container-custom">
          {/* شريط البحث والفلاتر */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              فلترة
            </Button>
          </div>

          {/* عرض المنتجات */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-delight-600 mb-4" />
              <p className="text-lg font-medium">جارِ تحميل المنتجات...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  عرض {filteredProducts.length} من {products.length} منتج
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    price={product.price}
                    rating={product.rating}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لم نجد منتجات مطابقة</h3>
              <p className="text-gray-600 mb-6">
                جرب البحث بكلمات مختلفة أو تصفح جميع المنتجات
              </p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
              >
                عرض جميع المنتجات
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
