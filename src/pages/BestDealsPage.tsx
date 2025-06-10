import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductDataService } from '@/services/productDataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VirtualizedProductGrid } from '@/components/performance/VirtualizedProductGrid';
import { SmoothPageTransition } from '@/components/performance/SmoothPageTransition';
import { useNavigate } from 'react-router-dom';
import EnhancedFilterDialog from '@/components/EnhancedFilterDialog';
import EnhancedFilterPanel from '@/components/EnhancedFilterPanel';
import { categoryService } from '@/services/adminService';
import type { CategoryNode } from '@/types/db';

// تم إزالة PageHeader لتوفير مساحة عرض

const BestDealsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // جلب جميع المنتجات من Supabase
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts,
  });

  // جلب شجرة الفئات للفلترة
  const { data: categoriesTree = [] } = useQuery<CategoryNode[], Error>({
    queryKey: ['categoryTree'],
    queryFn: categoryService.getCategoryTree,
  });

  // حساب نطاق السعر والماركات والأنواع والبائعين
  const prices = useMemo(
    () =>
      products.map((p) =>
        typeof p.price === 'string' ? parseFloat(p.price) : p.price
      ),
    [products]
  );
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  useEffect(() => {
    if (prices.length) setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])),
    [products]
  );
  const types = useMemo(() => Array.from(new Set(products.map(p => p.subtype).filter(Boolean) as string[])), [products]);
  const vendors = useMemo(() => Array.from(new Set(products.map(p => p.vendor).filter(Boolean) as string[])), [products]);

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedVendor(null);
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrand(null);
  };

  // تحديد العروض الخاصة
  const bestDeals = useMemo(() => {
    const parse = (str: string) => parseFloat(str.replace(/[^\d.]/g, ''));
    return products
      .filter(product => {
        if (!product.originalPrice) return false;
        const orig = parse(product.originalPrice);
        const curr = parse(product.price);
        return !isNaN(orig) && (orig - curr) / orig > 0.25;
      })
      .sort((a, b) => {
        const discountA = (parse(a.originalPrice!) - parse(a.price)) / parse(a.originalPrice!);
        const discountB = (parse(b.originalPrice!) - parse(b.price)) / parse(b.originalPrice!);
        return discountB - discountA;
      });
  }, [products]);

  // تطبيق الفلترة على العروض الخاصة
  const filteredDeals = useMemo(() => {
    let result = bestDeals;
    if (selectedCategory) {
      // تضمين الفئة المحددة وجميع الفئات الفرعية
      const getDescendants = (nodes: CategoryNode[], id: string): string[] => {
        let ids: string[] = [];
        for (const node of nodes) {
          if (node.id === id) {
            for (const child of node.children) {
              ids.push(child.id, ...getDescendants(node.children, child.id));
            }
          } else {
            ids.push(...getDescendants(node.children, id));
          }
        }
        return ids;
      };
      const allowedIds = [selectedCategory, ...getDescendants(categoriesTree, selectedCategory)];
      result = result.filter(p => p.category && allowedIds.includes(p.category));
    }
    if (selectedBrand) result = result.filter((p) => p.brand === selectedBrand);
    if (selectedType) result = result.filter((p) => p.subtype === selectedType);
    if (selectedVendor) result = result.filter((p) => p.vendor === selectedVendor);
    result = result.filter((p) => {
      const priceNum = typeof p.price === 'string'
        ? parseFloat(p.price.replace(/[^0-9.]/g, ''))
        : p.price;
      return priceNum >= priceRange[0] && priceNum <= priceRange[1];
    });
    if (!searchTerm.trim()) return result;
    return result.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, bestDeals, selectedCategory, categoriesTree, selectedBrand, priceRange, selectedType, selectedVendor]);

  if (error) {
    return (
      <div className="container-custom py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">حدث خطأ في تحميل الصفقات</h2>
          <p className="text-gray-600 mb-8">يرجى المحاولة مرة أخرى لاحقاً</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  
  // استخدام useCallback لتحسين الأداء
  const handleProductClick = useCallback((product) => {
    navigate(`/products/${product.id}`);
  }, [navigate]);

  return (
    <SmoothPageTransition transitionType="fade" duration={0.3}> {/* تقليل مدة الانتقال لتحسين الأداء */}
      <section className="py-16">
        <div className="container-custom" style={{ overflowX: 'hidden' }}> {/* منع التمرير الأفقي */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="hidden lg:block w-72">
              <EnhancedFilterPanel
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                types={types}
                selectedType={selectedType}
                onTypeSelect={setSelectedType}
                vendors={vendors}
                selectedVendor={selectedVendor}
                onVendorSelect={setSelectedVendor}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                brands={brands}
                selectedBrand={selectedBrand}
                onBrandSelect={setSelectedBrand}
                minPrice={minPrice}
                maxPrice={maxPrice}
                resetFilters={resetFilters}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-delight-600 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-12 rounded-full border-delight-200 focus:border-delight-400 focus:ring-delight-400 shadow-sm hover:border-delight-300 transition-all"
                  />
                </div>
                <EnhancedFilterDialog
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  types={types}
                  selectedType={selectedType}
                  onTypeSelect={setSelectedType}
                  vendors={vendors}
                  selectedVendor={selectedVendor}
                  onVendorSelect={setSelectedVendor}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  brands={brands}
                  selectedBrand={selectedBrand}
                  onBrandSelect={setSelectedBrand}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  resetFilters={resetFilters}
                />
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-delight-600 mb-4" />
                  <p className="text-lg font-medium">جارِ تحميل العروض...</p>
                </div>
              ) : filteredDeals.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                      عرض {filteredDeals.length} من {bestDeals.length} عرض
                    </p>
                  </div>
                  
                  <VirtualizedProductGrid 
                    products={filteredDeals.map(product => ({
                      ...product,
                      // التأكد من أن السعر رقم لتجنب أخطاء التحويل
                      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : product.price
                    }))} 
                    columns={{
                      default: 2, // عرض 2 منتجين في الصف على الأجهزة الصغيرة
                      sm: 2,
                      md: 3,
                      lg: 4
                    }}
                    gap={4} // زيادة المسافة بين العناصر قليلاً لتحسين المظهر
                    estimateSize={320} // تعديل الحجم التقديري للعناصر
                    onProductClick={handleProductClick}
                    className="mb-8"
                    useWindowScroll={true} // استخدام تمرير النافذة بدلاً من التمرير الداخلي
                  />
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">لم نجد عروض مطابقة</h3>
                  <p className="text-gray-600 mb-6">
                    جرب البحث بكلمات مختلفة أو تصفح جميع العروض
                  </p>
                  <Button 
                    onClick={resetFilters}
                    variant="outline"
                  >
                    عرض جميع العروض
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SmoothPageTransition>
  );
};

export default BestDealsPage;
