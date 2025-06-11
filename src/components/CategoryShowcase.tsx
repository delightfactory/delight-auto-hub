import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tag, ChevronLeft, Search, X, Folder, FileText, Star, Clock, TrendingUp, Heart } from 'lucide-react';
import { categoryService } from '@/services/adminService';
import { ProductDataService } from '@/services/productDataService';
import type { CategoryNode } from '@/types/db';
import { ProgressiveImage } from '@/components/performance/ProgressiveImage';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CategoryShowcaseProps {
  maxCategories?: number;
  showSearch?: boolean;
  onCategorySelect?: (id: string) => void;
  maxHeight?: string;
  compact?: boolean;
  showTabs?: boolean;
  showFavorites?: boolean;
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ 
  maxCategories = 12, 
  showSearch = true,
  onCategorySelect,
  maxHeight = '60vh',
  compact = false,
  showTabs = true,
  showFavorites = true
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  
  // استرجاع الفئات المفضلة من التخزين المحلي
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteCategories');
    if (storedFavorites) {
      setFavoriteCategories(JSON.parse(storedFavorites));
    }
  }, []);
  
  // حفظ الفئات المفضلة في التخزين المحلي
  const toggleFavorite = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favoriteCategories.includes(categoryId)
      ? favoriteCategories.filter(id => id !== categoryId)
      : [...favoriteCategories, categoryId];
    
    setFavoriteCategories(newFavorites);
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites));
  };
  
  // جلب شجرة الفئات
  const { data: categoryTree = [], isLoading } = useQuery<CategoryNode[]>({
    queryKey: ['categoryTree'],
    queryFn: categoryService.getCategoryTree,
  });

  // جلب جميع المنتجات لحساب عدد المنتجات في كل فئة
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts
  });

  // حساب عدد المنتجات في كل فئة
  const categoryProductsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // تسطيح شجرة الفئات لعرضها بشكل مسطح
  const flattenedCategories = useMemo(() => {
    const result: Array<CategoryNode & { level: number }> = [];
    
    const flatten = (nodes: CategoryNode[], level = 0) => {
      nodes.forEach(node => {
        result.push({ ...node, level });
        if (node.children.length > 0) {
          flatten(node.children, level + 1);
        }
      });
    };
    
    flatten(categoryTree);
    return result;
  }, [categoryTree]);
  
  // الفئات المفضلة
  const favoriteCategoriesData = useMemo(() => {
    return flattenedCategories.filter(category => 
      favoriteCategories.includes(category.id)
    );
  }, [flattenedCategories, favoriteCategories]);
  
  // الفئات الأكثر استخداماً (محاكاة بناءً على عدد المنتجات)
  const popularCategories = useMemo(() => {
    return [...flattenedCategories]
      .sort((a, b) => (categoryProductsCount[b.id] || 0) - (categoryProductsCount[a.id] || 0))
      .slice(0, maxCategories);
  }, [flattenedCategories, categoryProductsCount, maxCategories]);
  
  // الفئات الرئيسية فقط
  const mainCategories = useMemo(() => {
    return flattenedCategories.filter(category => category.level === 0);
  }, [flattenedCategories]);

  // فلترة الفئات حسب البحث والتبويب النشط
  const filteredCategories = useMemo(() => {
    let categories = flattenedCategories;
    
    // تطبيق فلتر التبويب النشط
    if (activeTab === 'main') {
      categories = mainCategories;
    } else if (activeTab === 'popular') {
      categories = popularCategories;
    } else if (activeTab === 'favorites') {
      categories = favoriteCategoriesData;
    }
    
    // تطبيق فلتر البحث
    if (searchQuery.trim()) {
      return categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return categories;
  }, [flattenedCategories, searchQuery, activeTab, mainCategories, popularCategories, favoriteCategoriesData]);

  // التوجه إلى صفحة المنتجات مع تطبيق الفلتر المناسب
  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      navigate(`/products?category=${categoryId}`);
    }
  };

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // تحديد لون الخلفية حسب مستوى الفئة
  const getCategoryBgColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-white';
      case 1: return 'bg-delight-50';
      case 2: return 'bg-gray-50';
      default: return 'bg-gray-100';
    }
  };

  // تحديد أيقونة الفئة حسب مستواها
  const getCategoryIcon = (category: CategoryNode & { level: number }) => {
    if (category.icon && category.icon.startsWith('http')) {
      return (
        <ProgressiveImage
          src={category.icon}
          alt={category.name}
          className="w-full h-full object-cover rounded-md"
          placeholderColor="#f3f4f6"
          blur={true}
        />
      );
    }
    
    const iconSize = compact ? 'h-6 w-6' : 'h-8 w-8';
    const childIconSize = compact ? 'h-5 w-5' : 'h-6 w-6';
    const grandchildIconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
    
    if (category.level === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-delight-50 to-delight-100 rounded-md">
          <Folder className={`${iconSize} text-delight-600`} />
        </div>
      );
    } else if (category.level === 1) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-md">
          <Folder className={`${childIconSize} text-amber-600`} />
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-md">
          <FileText className={`${grandchildIconSize} text-gray-500`} />
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showSearch && (
          <div className="relative w-full max-w-sm mx-auto">
            <div className="h-8 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 mt-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-2 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categoryTree.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* تبويبات الفئات */}
      {showTabs && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 w-full max-w-sm mx-auto text-xs">
            <TabsTrigger value="all" className="flex items-center gap-0.5 px-2 py-1 h-auto">
              <Tag size={12} />
              <span>الكل</span>
            </TabsTrigger>
            <TabsTrigger value="main" className="flex items-center gap-0.5 px-2 py-1 h-auto">
              <Folder size={12} />
              <span>الرئيسية</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-0.5 px-2 py-1 h-auto">
              <TrendingUp size={12} />
              <span>الشائعة</span>
            </TabsTrigger>
            {showFavorites && (
              <TabsTrigger value="favorites" className="flex items-center gap-0.5 px-2 py-1 h-auto">
                <Heart size={12} />
                <span>المفضلة</span>
                {favoriteCategoriesData.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {favoriteCategoriesData.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      )}
      
      {/* شريط البحث */}
      {showSearch && (
        <div className="relative w-full max-w-sm mx-auto">
          <Input
            placeholder="ابحث عن فئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 text-xs rounded-full border-delight-200 focus:border-delight-400 focus:ring-delight-400 h-8"
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-delight-600">
            <Search size={14} />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* عرض الفئات */}
      <ScrollArea className={`h-auto max-h-[${maxHeight}]`}>
        {filteredCategories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              {activeTab === 'favorites' ? 'لم تقم بإضافة أي فئات للمفضلة بعد' : 'لا توجد فئات مطابقة للبحث'}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredCategories.slice(0, maxCategories).map((category) => {
              const productCount = categoryProductsCount[category.id] || 0;
              const isFavorite = favoriteCategories.includes(category.id);
              
              return (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  className={`${getCategoryBgColor(category.level)} hover:bg-delight-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 group`}
                  onClick={() => handleCategoryClick(category.id)}
                  whileHover={{ y: -5, scale: 1.02 }}
                  style={{
                    transform: `scale(${1 - category.level * 0.03})`,
                    zIndex: 10 - category.level
                  }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {getCategoryIcon(category)}
                    
                    {/* عدد المنتجات */}
                    {productCount > 0 && (
                      <Badge className="absolute top-1 right-1 bg-delight-600 hover:bg-delight-700 transition-all duration-300 group-hover:scale-110 text-[10px] px-1.5 py-0">
                        {productCount}
                      </Badge>
                    )}
                    
                    {/* مستوى الفئة */}
                    {category.level > 0 && (
                      <Badge variant="outline" className="absolute bottom-1 left-1 bg-white/80 text-[8px] backdrop-blur-sm px-1 py-0">
                        فرعية {category.level}
                      </Badge>
                    )}
                    
                    {/* زر الإضافة للمفضلة */}
                    {showFavorites && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={(e) => toggleFavorite(category.id, e)}
                              className={`absolute top-1 left-1 p-1 rounded-full transition-all duration-300 ${isFavorite ? 'bg-red-100 text-red-500' : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'}`}
                            >
                              <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500' : ''}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>{isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* اسم الفئة على الصورة مع خلفية متدرجة شفافة */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium text-white ${compact ? 'text-xs' : (category.level === 0 ? 'text-xs' : 'text-[10px]')}`}>
                          {category.name}
                        </h3>
                        <ChevronLeft className="h-3 w-3 text-white group-hover:translate-x-[-2px] transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-200 mt-0.5 truncate">
                        {category.children.length > 0 
                          ? `${category.children.length} فئات فرعية` 
                          : 'تصفح المنتجات'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
};

export default CategoryShowcase;