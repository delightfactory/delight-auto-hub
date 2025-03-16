import React, { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/use-toast';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { ProductService, Product } from '@/services/productService';
import PageLoader from '@/components/PageLoader';
import { LoaderCircle, Filter, Search, RefreshCw, SlidersHorizontal, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'cleaner', name: 'منظفات' },
  { id: 'polish', name: 'ملمعات' },
  { id: 'protection', name: 'حماية' },
  { id: 'tire', name: 'الإطارات' }
];

interface Filters {
  category: string;
  priceRange: [number, number];
  rating: number | null;
}

const ProductsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    priceRange: [0, 500],
    rating: null
  });
  
  const controls = useAnimation();
  const { toast } = useToast();

  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 500];
    
    const prices = products.map(product => {
      const numericPrice = parseInt(product.price.replace(/\D/g, ''), 10);
      return isNaN(numericPrice) ? 0 : numericPrice;
    });
    
    return [
      Math.min(...prices),
      Math.max(...prices)
    ];
  }, [products]);

  const loadProducts = async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const allProducts = ProductService.getAllProducts();
      
      console.log("Fetched products:", allProducts);
      
      if (!allProducts || allProducts.length === 0) {
        throw new Error("لم يتم العثور على منتجات");
      }
      
      setProducts(allProducts);
      
      setFilters({
        category: 'all',
        priceRange: [priceRange[0], priceRange[1]],
        rating: null
      });
      
      controls.start('visible');
      
      toast({
        title: "تم تحميل المنتجات",
        description: `تم تحميل ${allProducts.length} منتج بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoadingError(error instanceof Error ? error.message : "حدث خطأ غير معروف");
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحميل المنتجات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ProductsPage mounted, loading products...");
    loadProducts();
    
    const timer = setTimeout(() => {
      controls.start('visible');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = 
        filters.category === 'all' || 
        (
          (filters.category === 'cleaner' && (product.name.includes('منظف') || product.description.includes('منظف'))) ||
          (filters.category === 'polish' && (product.name.includes('ملمع') || product.name.includes('تلميع') || product.description.includes('ملمع') || product.description.includes('تلميع'))) ||
          (filters.category === 'protection' && (product.name.includes('حماية') || product.name.includes('واقي') || product.description.includes('حماية') || product.description.includes('واقي'))) ||
          (filters.category === 'tire' && (product.name.includes('إطار') || product.description.includes('إطار')))
        );
        
      const productPrice = parseInt(product.price.replace(/\D/g, ''), 10);
      const matchesPrice = 
        productPrice >= filters.priceRange[0] && 
        productPrice <= filters.priceRange[1];
        
      const matchesRating = 
        filters.rating === null || 
        product.rating >= filters.rating;
        
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchTerm, filters]);

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15, 
        duration: 0.3 
      } 
    }
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [priceRange[0], priceRange[1]],
      rating: null
    });
    setSearchTerm('');
    
    toast({
      title: "تم إعادة ضبط التصفية",
      description: "تم عرض جميع المنتجات",
      duration: 2000,
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      category: categoryId
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]]
    }));
  };

  const handleRatingChange = (rating: number | null) => {
    setFilters(prev => ({
      ...prev,
      rating
    }));
  };

  if (isLoading) {
    return <PageLoader message="جاري تحميل المنتجات..." />;
  }

  return (
    <div className="pb-20">
      <motion.section 
        className="bg-gradient-to-r from-delight-800 to-blue-900 py-20 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading
              title="منتجاتنا"
              subtitle="مجموعة متكاملة من منتجات العناية بالسيارات الاحترافية"
              center
              className="text-white max-w-xl mx-auto"
            />
          </motion.div>
        </div>
      </motion.section>

      <section className="py-8 bg-delight-50/50 backdrop-blur-sm sticky top-0 z-30 border-b border-delight-100">
        <div className="container-custom">
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-full md:w-auto flex-1 max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-delight-500 focus:border-delight-500"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                onClick={() => loadProducts()}
              >
                <RefreshCw className="h-5 w-5 text-delight-600" />
                <span>تحديث</span>
              </motion.button>
              
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-5 w-5 text-delight-600" />
                    <span>تصفية النتائج</span>
                    {(filters.category !== 'all' || filters.rating !== null || 
                      filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                      <Badge className="bg-delight-500 hover:bg-delight-600 mr-2">تصفية نشطة</Badge>
                    )}
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-md">
                  <SheetHeader className="text-right">
                    <SheetTitle>خيارات التصفية</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <div className="space-y-6">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={filters.category === category.id}
                            onCheckedChange={() => handleCategoryChange(category.id)}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          نطاق السعر: {filters.priceRange[0]} - {filters.priceRange[1]} ريال
                        </h3>
                        <Slider
                          defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
                          max={priceRange[1]}
                          min={priceRange[0]}
                          step={5}
                          value={[filters.priceRange[0], filters.priceRange[1]]}
                          onValueChange={handlePriceRangeChange}
                          className="my-6"
                        />
                      </div>
                      
                      <Separator />
                      
                      {[null, 5, 4, 3, 2, 1].map((rating, i) => (
                        <Badge 
                          key={i}
                          variant={filters.rating === rating ? "default" : "outline"}
                          className={`cursor-pointer ${filters.rating === rating ? 'bg-delight-600' : ''}`}
                          onClick={() => handleRatingChange(rating)}
                        >
                          {rating === null ? 'الكل' : `${rating}+`}
                          {rating !== null && (
                            <span className="ml-1 inline-flex">
                              {[...Array(rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-8 space-y-2">
                      <Button 
                        onClick={resetFilters}
                        variant="outline" 
                        className="w-full"
                      >
                        إعادة ضبط التصفية
                      </Button>
                      <Button 
                        onClick={() => setIsFilterSheetOpen(false)}
                        className="w-full"
                      >
                        عرض {filteredProducts.length} منتج
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>
        </div>
      </section>

      {(filters.category !== 'all' || filters.rating !== null || 
        filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] || searchTerm) && (
        <div className="bg-white py-3 border-b border-gray-100">
          <div className="container-custom">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">التصفية الحالية:</span>
              
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>بحث: {searchTerm}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>الفئة: {categories.find(c => c.id === filters.category)?.name}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange('all')}
                  />
                </Badge>
              )}
              
              {filters.rating !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>التقييم: {filters.rating}+</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRatingChange(null)}
                  />
                </Badge>
              )}
              
              {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>السعر: {filters.priceRange[0]} - {filters.priceRange[1]} ريال</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handlePriceRangeChange([priceRange[0], priceRange[1]])}
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-xs"
              >
                إعادة ضبط الكل
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="py-16">
        <div className="container-custom">
          {loadingError ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md mx-auto mb-6">
                  <p className="font-bold text-lg mb-2">حدث خطأ أثناء تحميل المنتجات</p>
                  <p>{loadingError}</p>
                </div>
                <Button 
                  onClick={loadProducts}
                  className="bg-delight-500 hover:bg-delight-600 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 ml-2" />
                  إعادة المحاولة
                </Button>
              </motion.div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-amber-50 text-amber-700 p-6 rounded-lg max-w-md mx-auto mb-6">
                  <p className="font-bold text-lg mb-2">لا توجد منتجات تطابق معايير البحث</p>
                  <p>حاول تغيير معايير البحث أو التصفية للعثور على المنتجات المطلوبة.</p>
                </div>
                <Button 
                  onClick={resetFilters}
                  className="bg-delight-500 hover:bg-delight-600 transition-colors"
                >
                  إعادة ضبط التصفية
                </Button>
              </motion.div>
            </div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerVariants}
                initial="hidden"
                animate={controls}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      image={product.image || 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products'}
                      price={product.price}
                      rating={product.rating}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-delight-700 mb-4">تم عرض {filteredProducts.length} من {products.length} منتج</p>
              </motion.div>
            </>
          )}
        </div>
      </section>

      <section className="bg-delight-50 py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <SectionHeading
              title="منتجات احترافية للعناية بسيارتك"
              subtitle="تمتع بتجربة مميزة مع منتجات ديلايت المصنوعة بأعلى معايير الجودة"
              center
            />
            <p className="mt-6 max-w-2xl mx-auto text-gray-600">
              جميع منتجاتنا مصنعة محلياً في المملكة العربية السعودية باستخدام أحدث التقنيات والمواد عالية الجودة. نحن نضمن رضاك التام عن كل منتج من منتجاتنا.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8"
            >
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-delight-600 to-delight-700 hover:from-delight-700 hover:to-delight-800 text-white px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-all text-lg">
                  تواصل معنا
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
