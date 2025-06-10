import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import FilterPanel from './FilterPanel';
import type { CategoryNode } from '@/types/db';

interface FilterDialogProps {
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

const FilterDialog: React.FC<FilterDialogProps> = ({
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
  <Dialog>
    <DialogTrigger asChild>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 lg:hidden rounded-full px-4 py-2 border-delight-200 hover:bg-delight-50 transition-all shadow-sm"
        size="sm"
      >
        <Filter className="h-4 w-4 text-delight-600" />
        <span>فلترة</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-white bg-delight-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </DialogTrigger>
    <DialogContent
      className="lg:hidden bg-white dark:bg-gray-900 shadow-lg p-0 flex flex-col"
      style={{
        position: 'fixed', top: '50%', right: 0,
        width: '90%', maxWidth: '400px', height: '85vh',
        transform: 'translateY(-50%)', maxHeight: '85vh', overflowY: 'hidden',
        borderRadius: '12px'
      }}
    >
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-delight-600" />
          <h2 className="text-lg font-semibold">تصفية المنتجات</h2>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-delight-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </Button>
        </DialogClose>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pb-16 p-4">
          <DialogDescription id="filter-dialog-description" className="sr-only">
            نافذة تصفية المنتجات حسب الفئات والأنواع والماركات
          </DialogDescription>
          <FilterPanel
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
      </div>
      
      <div className="border-t p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky bottom-0 left-0 right-0 z-10 shadow-md">
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={resetFilters} size="sm">
            مسح الفلاتر
          </Button>
          <DialogClose asChild>
            <Button size="sm">
              تطبيق
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
}

export default FilterDialog;
