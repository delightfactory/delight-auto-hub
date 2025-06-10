import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import EnhancedFilterPanel from './EnhancedFilterPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CategoryNode } from '@/types/db';

interface EnhancedFilterDialogProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
  types: string[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  vendors: string[];
  selectedVendor: string | null;
  onVendorSelect: (vendor: string | null) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  brands: string[];
  selectedBrand: string | null;
  onBrandSelect: (brand: string | null) => void;
  resetFilters: () => void;
  minPrice: number;
  maxPrice: number;
}

const EnhancedFilterDialog: React.FC<EnhancedFilterDialogProps> = ({
  selected,
  onSelect,
  types,
  selectedType,
  onTypeSelect,
  vendors,
  selectedVendor,
  onVendorSelect,
  priceRange,
  onPriceChange,
  brands,
  selectedBrand,
  onBrandSelect,
  resetFilters,
  minPrice,
  maxPrice,
}) => {
  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = [
    selected !== null,
    selectedType !== null,
    selectedVendor !== null,
    selectedBrand !== null,
    !(priceRange[0] === minPrice && priceRange[1] === maxPrice)
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 lg:hidden rounded-full shadow-sm border-delight-200 hover:border-delight-300 transition-all h-10 px-4 py-2">
          <Filter className="h-4 w-4" />
          <span>فلترة</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-white bg-delight-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="lg:hidden p-0 w-[90%] sm:max-w-md border-l shadow-lg flex flex-col"
        style={{ height: '85vh', top: '50%', transform: 'translateY(-50%)' }}
      >
        <SheetHeader className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-delight-600" />
            <SheetTitle className="text-lg font-semibold">تصفية المنتجات</SheetTitle>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-delight-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">إغلاق</span>
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full overflow-y-auto pb-16">
            <div className="p-4">
              <EnhancedFilterPanel
                selected={selected}
                onSelect={onSelect}
                types={types}
                selectedType={selectedType}
                onTypeSelect={onTypeSelect}
                vendors={vendors}
                selectedVendor={selectedVendor}
                onVendorSelect={onVendorSelect}
                priceRange={priceRange}
                onPriceChange={onPriceChange}
                brands={brands}
                selectedBrand={selectedBrand}
                onBrandSelect={onBrandSelect}
                resetFilters={resetFilters}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>
          </ScrollArea>
        </div>
        
        <SheetFooter className="border-t p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-10 shadow-md">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={resetFilters} size="sm">
              مسح الفلاتر
            </Button>
            <SheetClose asChild>
              <Button size="sm">
                تطبيق
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedFilterDialog;