import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, Tag, X, Folder, FolderOpen, FileText } from 'lucide-react';
import { categoryService } from '@/services/adminService';
import type { CategoryNode } from '@/types/db';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CategorySidebarProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
  showSearch?: boolean;
  maxHeight?: string;
  categoryProductsCount?: Record<string, number>;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  selected, 
  onSelect, 
  showSearch = true,
  maxHeight = 'calc(100vh-4rem)',
  categoryProductsCount = {}
}) => {
  const { data: tree = [] } = useQuery<CategoryNode[]>({
    queryKey: ['categoryTree'],
    queryFn: categoryService.getCategoryTree,
  });
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  
  // تحديث الفئة المحددة عند تغيير selected
  useEffect(() => {
    if (selected && tree.length > 0) {
      const findCategory = (nodes: CategoryNode[]): CategoryNode | null => {
        for (const node of nodes) {
          if (node.id === selected) return node;
          if (node.children.length > 0) {
            const found = findCategory(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedCategory(findCategory(tree));
      
      // فتح الفئات الأب تلقائيًا
      const openParents = (nodes: CategoryNode[], targetId: string, parentMap: Record<string, boolean> = {}): Record<string, boolean> => {
        for (const node of nodes) {
          if (node.id === targetId) return parentMap;
          
          if (node.children.length > 0) {
            for (const child of node.children) {
              if (child.id === targetId || containsChild(child.children, targetId)) {
                parentMap[node.id] = true;
                return openParents(nodes, node.parent_id || '', parentMap);
              }
            }
          }
        }
        return parentMap;
      };
      
      const containsChild = (nodes: CategoryNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) return true;
          if (node.children.length > 0 && containsChild(node.children, targetId)) return true;
        }
        return false;
      };
      
      if (selected) {
        setOpenMap(prev => ({
          ...prev,
          ...openParents(tree, selected)
        }));
      }
    } else {
      setSelectedCategory(null);
    }
  }, [selected, tree]);

  const toggleOpen = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // فلترة الفئات حسب البحث
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    
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
    
    return filterNodes(tree);
  }, [tree, searchQuery]);

  // تحديد ما إذا كانت الفئة هي فئة رئيسية (أب) أم لا
  const isRootCategory = (node: CategoryNode): boolean => {
    return !node.parent_id;
  };

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
    
    const parent = node.parent_id ? findParent(tree, node.parent_id) : null;
    if (parent && !parent.parent_id) return 'child';
    return 'grandchild';
  };

  const renderNodes = (nodes: CategoryNode[], depth = 0) =>
    nodes.map(node => {
      const isOpen = openMap[node.id];
      const hasChildren = node.children.length > 0;
      const isActive = selected === node.id;
      const level = getCategoryLevel(node);
      const isRoot = isRootCategory(node);
      const productCount = categoryProductsCount[node.id] || 0;
      
      return (
        <div key={node.id} className="relative">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center p-2 cursor-pointer transition-all duration-200 
                    ${isActive ? 'bg-delight-50 dark:bg-delight-900/20 text-delight-600 dark:text-delight-400 font-medium border-r-2 border-delight-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} 
                    ${isRoot ? 'font-semibold rounded-md my-1' : 'rounded-sm my-0.5'}
                    ${level === 'child' ? 'text-sm' : level === 'grandchild' ? 'text-xs' : 'text-base'}
                  `}
                  style={{ 
                    paddingLeft: depth * 16 + 8,
                    borderLeft: isRoot ? '3px solid #f59e0b' : 'none',
                    backgroundColor: isRoot && !isActive ? '#f8fafc' : ''
                  }}
                  onClick={() => onSelect(node.id)}
                >
                  {/* أيقونة الفئة حسب نوعها ومستواها */}
                  {hasChildren ? (
                    <motion.button 
                      className={`flex items-center justify-center w-6 h-6 rounded-full 
                        ${isRoot ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-gray-800'} 
                        hover:bg-delight-100 dark:hover:bg-delight-900/30 transition-all duration-300 shadow-sm hover:shadow-md`}
                      onClick={(e) => toggleOpen(node.id, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ rotate: isOpen ? 90 : 0 }}
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                      {isRoot ? (
                        isOpen ? 
                          <FolderOpen size={14} className="text-amber-600" /> : 
                          <Folder size={14} className="text-amber-600" />
                      ) : (
                        <ChevronRight size={14} className={`text-delight-600 dark:text-delight-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                      )}
                    </motion.button>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center">
                      {isRoot ? 
                        <Folder size={14} className="text-amber-600" /> : 
                        <FileText size={12} className="text-gray-400" />
                      }
                    </div>
                  )}
                  
                  {/* اسم الفئة وعدد المنتجات */}
                  <div className="ml-2 flex flex-col">
                    <span className={`transition-colors ${isActive ? 'text-delight-600 dark:text-delight-400' : ''}`}>
                      {node.name}
                    </span>
                    {productCount > 0 && (
                      <span className={`text-xs ${isRoot ? 'text-amber-600' : 'text-gray-400 dark:text-gray-500'}`}>
                        {productCount} منتج
                      </span>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div>
                  <p className="font-semibold">{node.name}</p>
                  {node.description && <p className="text-xs text-gray-500">{node.description}</p>}
                  <p className="text-xs mt-1">{productCount} منتج</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <AnimatePresence initial={false}>
            {hasChildren && isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderNodes(node.children, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });

  // تجميع الفئات الرئيسية (الأب) للعرض السريع
  const rootCategories = useMemo(() => {
    return tree.filter(node => !node.parent_id);
  }, [tree]);

  return (
    <aside className="bg-white dark:bg-gray-900 border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {showSearch && (
        <div className="p-3 border-b">
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* عرض الفئات الرئيسية للوصول السريع */}
          {!searchQuery && rootCategories.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1.5">الأقسام الرئيسية:</div>
              <div className="flex flex-wrap gap-1.5">
                {rootCategories.slice(0, 5).map(category => (
                  <Badge 
                    key={category.id}
                    variant={selected === category.id ? "default" : "outline"}
                    className={`cursor-pointer px-2 py-1 ${selected === category.id ? 'bg-delight-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => onSelect(category.id)}
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    <span>{category.name}</span>
                  </Badge>
                ))}
                {rootCategories.length > 5 && (
                  <Badge variant="secondary" className="cursor-pointer px-2 py-1">
                    +{rootCategories.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {selectedCategory && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1.5">الفئة المحددة:</div>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1 px-3 py-1.5 bg-delight-50 dark:bg-delight-900/20 text-delight-600 dark:text-delight-400 border-delight-200 dark:border-delight-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                <span>{selectedCategory.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-transparent ml-1" 
                  onClick={() => onSelect(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
          
          {searchQuery && filteredTree.length === 0 && (
            <div className="py-3 text-center text-gray-500 text-sm">
              لا توجد نتائج مطابقة
            </div>
          )}
        </div>
      )}
      
      <ScrollArea className="overflow-y-auto" style={{ maxHeight: maxHeight }}>
        <div className="p-2">
          {filteredTree.length > 0 ? (
            <div className="space-y-1">
              {/* عنوان توضيحي للفئات */}
              {!searchQuery && (
                <div className="px-2 py-1 text-xs text-gray-500 border-b border-gray-100 mb-2">
                  تصفح حسب الفئات
                </div>
              )}
              {renderNodes(filteredTree)}
            </div>
          ) : !searchQuery ? (
            <div className="py-3 text-center text-gray-500 text-sm">
              لا توجد فئات متاحة
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default CategorySidebar;
