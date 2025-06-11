import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, Tag, X, Folder, FolderOpen, FileText, ChevronLeft, Plus } from 'lucide-react';
import { categoryService } from '@/services/adminService';
import { ProductDataService } from '@/services/productDataService';
import type { CategoryNode } from '@/types/db';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressiveImage } from '@/components/performance/ProgressiveImage';

interface HierarchicalCategoryBrowserProps {
  maxCategories?: number;
  showSearch?: boolean;
  showAllCategories?: boolean;
  onCategorySelect?: (id: string) => void;
}

const HierarchicalCategoryBrowser: React.FC<HierarchicalCategoryBrowserProps> = ({
  maxCategories = 6,
  showSearch = true,
  showAllCategories = true,
  onCategorySelect,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // جلب شجرة الفئات
  const { data: categoryTree = [], isLoading: loadingCategories } = useQuery<CategoryNode[]>({
    queryKey: ['categoryTree'],
    queryFn: categoryService.getCategoryTree,
  });

  // جلب جميع المنتجات لحساب عدد المنتجات في كل فئة
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts
  });

  // حساب عدد المنتجات في كل فئة (بما في ذلك الفئات الفرعية)
  const categoryProductsCount = useMemo(() => {
    // أولاً، نحسب المنتجات المباشرة لكل فئة
    const directCounts: Record<string, number> = {};
    products.forEach(product => {
      if (product.category) {
        directCounts[product.category] = (directCounts[product.category] || 0) + 1;
      }
    });
    
    // ثم نحسب العدد التراكمي بما في ذلك الفئات الفرعية
    const totalCounts: Record<string, number> = {...directCounts};
    
    // دالة تكرارية لحساب عدد المنتجات في فئة وجميع فئاتها الفرعية
    const calculateTotalCount = (node: CategoryNode): number => {
      // عدد المنتجات المباشرة في هذه الفئة
      let count = directCounts[node.id] || 0;
      
      // إضافة عدد المنتجات من الفئات الفرعية
      node.children.forEach(child => {
        const childCount = calculateTotalCount(child);
        count += childCount;
      });
      
      // تخزين العدد الإجمالي لهذه الفئة
      totalCounts[node.id] = count;
      
      return count;
    };
    
    // حساب العدد الإجمالي لكل فئة جذر
    categoryTree.forEach(rootCategory => {
      calculateTotalCount(rootCategory);
    });
    
    return totalCounts;
  }, [products, categoryTree]);

  // الحصول على الفئات الرئيسية فقط (الفئات الأب)
  const rootCategories = useMemo(() => {
    return categoryTree.filter(node => !node.parent_id).slice(0, maxCategories);
  }, [categoryTree, maxCategories]);

  // فلترة الفئات حسب البحث
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoryTree;
    
    const filterNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .map(node => {
          // تحقق إذا كان اسم الفئة يحتوي على كلمة البحث
          const nameMatches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
          
          // تحقق من الفئات الفرعية
          const filteredChildren = filterNodes(node.children);
          
          // إذا كان الاسم يطابق أو كان لديه أطفال مطابقين، قم بإرجاع الفئة
          if (nameMatches || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren
            };
          }
          
          // لا تطابق
          return null;
        })
        .filter((node): node is CategoryNode => node !== null);
    };
    
    return filterNodes(categoryTree);
  }, [categoryTree, searchQuery]);

  // تحديد مستوى الفئة (الأب، الابن، الحفيد)
  const getCategoryLevel = (node: CategoryNode): 'parent' | 'child' | 'grandchild' => {
    if (!node.parent_id) return 'parent';
    
    // البحث عن الفئة الأب لتحديد ما إذا كانت فئة ابن أو حفيد
    const findParent = (nodes: CategoryNode[], parentId: string): CategoryNode | null => {
      for (const n of nodes) {
        if (n.id === parentId) return n;
        const found = findParent(n.children, parentId);
        if (found) return found;
      }
      return null;
    };
    
    const parent = node.parent_id ? findParent(categoryTree, node.parent_id) : null;
    if (parent && !parent.parent_id) return 'child';
    return 'grandchild';
  };

  // التوجه إلى صفحة المنتجات مع تطبيق الفلتر المناسب
  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      navigate(`/products?category=${categoryId}`);
    }
  };

  // تبديل حالة توسيع الفئة
  const toggleExpand = (categoryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
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

  // عرض الفئات الرئيسية في شكل بطاقات
  const renderFeaturedCategories = () => {
    if (loadingCategories) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {rootCategories.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            className="bg-white hover:bg-delight-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => handleCategoryClick(category.id)}
            whileHover={{ y: -5 }}
          >
            <div className="aspect-square relative overflow-hidden">
              {category.icon ? (
                category.icon.startsWith('http') ? (
                  <ProgressiveImage
                    src={category.icon}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    placeholderColor="#f3f4f6"
                    blur={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-delight-100">
                    <Tag className="h-12 w-12 text-delight-600" />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-delight-100">
                  <Folder className="h-12 w-12 text-delight-600" />
                </div>
              )}
              {categoryProductsCount[category.id] > 0 && (
                <div className="absolute top-2 right-2 bg-delight-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {categoryProductsCount[category.id]} منتج
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                <ChevronLeft className="h-4 w-4 text-delight-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {category.children.length > 0 ? `${category.children.length} فئات فرعية` : 'تصفح المنتجات'}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // عرض الفئات الفرعية بشكل هرمي
  const renderCategoryTree = (nodes: CategoryNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedCategories[node.id];
      const hasChildren = node.children.length > 0;
      const level = getCategoryLevel(node);
      const productCount = categoryProductsCount[node.id] || 0;
      
      return (
        <div key={node.id} className="relative">
          <div 
            className={`flex items-center p-2 cursor-pointer transition-all duration-200 rounded-md my-1
              ${selectedCategory === node.id ? 'bg-delight-50 text-delight-600 font-medium' : 'hover:bg-gray-100'}
              ${level === 'child' ? 'text-sm' : level === 'grandchild' ? 'text-xs' : 'text-base'}
            `}
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => {
              setSelectedCategory(node.id);
              handleCategoryClick(node.id);
            }}
          >
            {/* أيقونة الفئة */}
            {hasChildren ? (
              <motion.button
                className={`flex items-center justify-center w-6 h-6 rounded-full 
                  ${level === 'parent' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100'} 
                  hover:bg-delight-100 transition-all duration-300 shadow-sm hover:shadow-md mr-2`}
                onClick={(e) => toggleExpand(node.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ rotate: isExpanded ? 90 : 0 }}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                {level === 'parent' ? (
                  isExpanded ? 
                    node.icon && node.icon.startsWith('http') ? (
                      <img src={node.icon} alt="" className="w-4 h-4 object-contain" />
                    ) : <FolderOpen size={14} className="text-amber-600" />
                  : 
                    node.icon && node.icon.startsWith('http') ? (
                      <img src={node.icon} alt="" className="w-4 h-4 object-contain" />
                    ) : <Folder size={14} className="text-amber-600" />
                ) : (
                  <ChevronRight size={14} className="text-delight-600" />
                )}
              </motion.button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center mr-2">
                {level === 'parent' ? 
                  node.icon && node.icon.startsWith('http') ? (
                    <img src={node.icon} alt="" className="w-4 h-4 object-contain" />
                  ) : <Folder size={14} className="text-amber-600" />
                : 
                  <FileText size={12} className="text-gray-400" />
                }
              </div>
            )}
            
            {/* اسم الفئة وعدد المنتجات */}
            <div className="flex flex-col">
              <span className={`transition-colors ${selectedCategory === node.id ? 'text-delight-600' : ''}`}>
                {node.name}
              </span>
              {productCount > 0 && (
                <span className={`text-xs ${level === 'parent' ? 'text-amber-600' : 'text-gray-400'}`}>
                  {productCount} منتج
                </span>
              )}
            </div>
          </div>
          
          {/* الفئات الفرعية */}
          <AnimatePresence initial={false}>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderCategoryTree(node.children, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  // عرض جميع الفئات بشكل هرمي
  const renderAllCategories = () => {
    if (!showAllCategories) return null;

    return (
      <Card className="mt-8 overflow-hidden">
        <CardContent className="p-0">
          {showSearch && (
            <div className="p-4 border-b">
              <div className="relative">
                <Input
                  placeholder="ابحث عن فئة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          <ScrollArea className="h-[400px] overflow-y-auto">
            <div className="p-4">
              {filteredCategories.length > 0 ? (
                <div className="space-y-1">
                  {renderCategoryTree(filteredCategories.filter(cat => !cat.parent_id))}
                </div>
              ) : (
                <div className="py-3 text-center text-gray-500 text-sm">
                  {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد فئات متاحة'}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="category-browser">
      {renderFeaturedCategories()}
      {renderAllCategories()}
    </div>
  );
};

export default HierarchicalCategoryBrowser;