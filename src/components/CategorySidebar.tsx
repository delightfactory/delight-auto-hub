import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, Tag, X } from 'lucide-react';
import { categoryService } from '@/services/adminService';
import type { CategoryNode } from '@/types/db';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const renderNodes = (nodes: CategoryNode[], depth = 0) =>
    nodes.map(node => {
      const isOpen = openMap[node.id];
      const hasChildren = node.children.length > 0;
      const isActive = selected === node.id;
      
      return (
        <div key={node.id} className="relative">
          <div
            className={`flex items-center p-2 cursor-pointer transition-colors duration-200 ${isActive ? 'bg-delight-50 dark:bg-delight-900/20 text-delight-600 dark:text-delight-400 font-medium border-r-2 border-delight-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} rounded-sm my-0.5`}
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => onSelect(node.id)}
          >
            {hasChildren ? (
              <motion.button 
                className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-delight-100 dark:hover:bg-delight-900/30 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={(e) => toggleOpen(node.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ rotate: isOpen ? 90 : 0 }}
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                <ChevronRight size={14} className={`text-delight-600 dark:text-delight-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
              </motion.button>
            ) : <div className="w-6 h-6" />}
            
            <span className={`ml-2 text-sm transition-colors ${isActive ? 'text-delight-600 dark:text-delight-400' : ''}`}>
              {node.name}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({categoryProductsCount[node.id] || 0})</span>
            </span>
          </div>
          
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

  return (
    <aside className="bg-white dark:bg-gray-900 border rounded-md overflow-hidden">
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
            renderNodes(filteredTree)
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
