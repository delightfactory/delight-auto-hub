import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X, Search, Tag, User, Star, List, DollarSign, SlidersHorizontal } from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import type { CategoryNode } from '@/types/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductDataService } from '@/services/productDataService';

interface EnhancedFilterPanelProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
  types: string[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  vendors: string[];
  selectedVendor: string | null;
  onVendorSelect: (vendor: string | null) => void;
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  brands: string[];
  selectedBrand: string | null;
  onBrandSelect: (brand: string | null) => void;
  resetFilters: () => void;
}

const EnhancedFilterPanel: React.FC<EnhancedFilterPanelProps> = ({
  selected,
  onSelect,
  types,
  selectedType,
  onTypeSelect,
  vendors,
  selectedVendor,
  onVendorSelect,
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  brands,
  selectedBrand,
  onBrandSelect,
  resetFilters,
}) => {
  const [searchBrand, setSearchBrand] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchVendor, setSearchVendor] = useState('');
  
  // جلب جميع المنتجات لحساب عدد المنتجات في كل فئة
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: ProductDataService.getAllProducts
  });

  // فلترة العلامات التجارية حسب البحث
  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(searchBrand.toLowerCase())
  );

  // فلترة الأنواع حسب البحث
  const filteredTypes = types.filter(type => 
    type.toLowerCase().includes(searchType.toLowerCase())
  );

  // فلترة البائعين حسب البحث
  const filteredVendors = vendors.filter(vendor => 
    vendor.toLowerCase().includes(searchVendor.toLowerCase())
  );

  // الحصول على queryClient في المستوى الأعلى من المكون
  const queryClient = useQueryClient();
  
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
    
    // الحصول على شجرة الفئات من React Query Cache
    const categoryTree = queryClient.getQueryData<CategoryNode[]>(['categoryTree']) || [];
    
    // حساب العدد الإجمالي لكل فئة جذر
    categoryTree.forEach(rootCategory => {
      calculateTotalCount(rootCategory);
    });
    
    return totalCounts;
  }, [products, queryClient]);
  
  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = [
    selected !== null,
    selectedType !== null,
    selectedVendor !== null,
    selectedBrand !== null,
    !(priceRange[0] === minPrice && priceRange[1] === maxPrice)
  ].filter(Boolean).length;

  return (
    <Card className="w-full max-w-[260px] overflow-hidden shadow-lg border-0 bg-white dark:bg-gray-900 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-delight-600" />
          <h3 className="text-sm font-semibold tracking-wide">الفلاتر</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="mr-1 h-5 w-5 flex items-center justify-center p-0">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-gray-500 hover:text-delight-600 h-6 px-1.5 text-xs"
        >
          مسح
        </Button>
      </CardHeader>

      <CardContent className="p-0 relative">
        <ScrollArea className="h-[calc(100vh-200px)] overflow-y-auto pb-3">
          <div className="p-3 space-y-4">
            {/* عرض الفلاتر النشطة */}
            {activeFiltersCount > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium mb-1.5 text-gray-500">الفلاتر النشطة</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selected && (
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                      <span>الفئة</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => onSelect(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedType && (
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                      <span>{selectedType}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => onTypeSelect(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedVendor && (
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                      <span>{selectedVendor}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => onVendorSelect(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedBrand && (
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                      <span>{selectedBrand}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => onBrandSelect(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {!(priceRange[0] === minPrice && priceRange[1] === maxPrice) && (
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                      <span>{priceRange[0]} - {priceRange[1]} جنيه</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => onPriceChange([minPrice, maxPrice])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
              {/* الفئات */}
              <AccordionItem value="categories" className="border-b border-gray-200 dark:border-gray-700">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-delight-600" />
                    <span className="font-medium">الفئة</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <CategorySidebar 
                    selected={selected} 
                    onSelect={onSelect} 
                    showSearch={true} 
                    maxHeight="250px"
                    categoryProductsCount={categoryProductsCount}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* السعر */}
              <AccordionItem value="price" className="border-b border-gray-200 dark:border-gray-700">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-delight-600" />
                    <span className="font-medium">السعر</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2 px-1">
                  <div className="space-y-3">
                    <div className="pt-2 px-1">
                      <Slider
                        value={priceRange}
                        onValueChange={onPriceChange}
                        min={minPrice}
                        max={maxPrice}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col w-[48%]">
                        <span className="text-xs text-gray-500 mb-1">من</span>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => onPriceChange([+e.target.value, priceRange[1]])}
                          className="h-7 text-sm px-2"
                        />
                      </div>
                      <div className="flex flex-col w-[48%]">
                        <span className="text-xs text-gray-500 mb-1">إلى</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => onPriceChange([priceRange[0], +e.target.value])}
                          className="h-7 text-sm px-2"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* النوع */}
              {types.length > 0 && (
                <AccordionItem value="type" className="border-b border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-delight-600" />
                      <span className="font-medium">النوع</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="relative mb-3">
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="بحث عن نوع..."
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="pr-8 h-8 text-sm"
                      />
                    </div>
                    <ScrollArea className="h-40">
                      <div className="space-y-1">
                        {filteredTypes.length > 0 ? (
                          filteredTypes.map((type) => (
                            <label key={type} className="flex items-center py-1 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                              <Checkbox
                                checked={selectedType === type}
                                onCheckedChange={(checked) => onTypeSelect(checked ? type : null)}
                                className="ml-2 data-[state=checked]:bg-delight-600 data-[state=checked]:border-delight-600"
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">لا توجد نتائج</p>
                        )}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* البائع */}
              {vendors.length > 0 && (
                <AccordionItem value="vendor" className="border-b border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-delight-600" />
                      <span className="font-medium">البائع</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="relative mb-3">
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="بحث عن بائع..."
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
                        className="pr-8 h-8 text-sm"
                      />
                    </div>
                    <ScrollArea className="h-40">
                      <div className="space-y-1">
                        {filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <label key={vendor} className="flex items-center py-1 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                              <Checkbox
                                checked={selectedVendor === vendor}
                                onCheckedChange={(checked) => onVendorSelect(checked ? vendor : null)}
                                className="ml-2 data-[state=checked]:bg-delight-600 data-[state=checked]:border-delight-600"
                              />
                              <span className="text-sm">{vendor}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">لا توجد نتائج</p>
                        )}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* العلامة التجارية */}
              {brands.length > 0 && (
                <AccordionItem value="brand" className="border-b border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-delight-600" />
                      <span className="font-medium">العلامة التجارية</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="relative mb-3">
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="بحث عن علامة تجارية..."
                        value={searchBrand}
                        onChange={(e) => setSearchBrand(e.target.value)}
                        className="pr-8 h-8 text-sm"
                      />
                    </div>
                    <ScrollArea className="h-40">
                      <div className="space-y-1">
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand) => (
                            <label key={brand} className="flex items-center py-1 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                              <Checkbox
                                checked={selectedBrand === brand}
                                onCheckedChange={(checked) => onBrandSelect(checked ? brand : null)}
                                className="ml-2 data-[state=checked]:bg-delight-600 data-[state=checked]:border-delight-600"
                              />
                              <span className="text-sm">{brand}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">لا توجد نتائج</p>
                        )}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EnhancedFilterPanel;