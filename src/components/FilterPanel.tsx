import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import CategorySidebar from './CategorySidebar';
import type { CategoryNode } from '@/types/db';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag, User, Star, List, DollarSign } from 'lucide-react';

interface FilterPanelProps {
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

const FilterPanel: React.FC<FilterPanelProps> = ({
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
}) => (
  <Card className="w-full overflow-hidden shadow-lg">
    <CardHeader className="flex items-center justify-between p-4 border-b">
      <h3 className="text-lg font-semibold uppercase tracking-wide">تصفية</h3>
      <Button variant="link" size="sm" onClick={resetFilters}>مسح الكل</Button>
    </CardHeader>
    <CardContent className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h4 className="flex items-center text-base font-medium mb-2">
              <List className="w-5 h-5 ml-2" /> الفئة
            </h4>
            <CategorySidebar selected={selected} onSelect={onSelect} />
          </div>
          {/* Price */}
          <div>
            <h4 className="flex items-center text-base font-medium mb-2">
              <DollarSign className="w-5 h-5 ml-2" /> السعر
            </h4>
            <Slider
              value={priceRange}
              onValueChange={onPriceChange}
              min={minPrice}
              max={maxPrice}
              className="w-full"
            />
            <div className="mt-2 flex space-x-2 rtl:space-x-reverse">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([+e.target.value, priceRange[1]])}
                className="flex-1"
              />
              <span className="text-gray-500">—</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], +e.target.value])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          {/* Type */}
          <div>
            <h4 className="flex items-center text-base font-medium mb-2">
              <Tag className="w-5 h-5 ml-2" /> النوع
            </h4>
            <div className="space-y-1">
              {types.map((type) => (
                <label key={type} className="flex items-center">
                  <Checkbox
                    checked={selectedType === type}
                    onCheckedChange={(checked) => onTypeSelect(checked ? type : null)}
                    className="ml-2"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Vendor */}
          <div>
            <h4 className="flex items-center text-base font-medium mb-2">
              <User className="w-5 h-5 ml-2" /> البائع
            </h4>
            <div className="space-y-1">
              {vendors.map((vendor) => (
                <label key={vendor} className="flex items-center">
                  <Checkbox
                    checked={selectedVendor === vendor}
                    onCheckedChange={(checked) => onVendorSelect(checked ? vendor : null)}
                    className="ml-2"
                  />
                  <span>{vendor}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Brand */}
          <div>
            <h4 className="flex items-center text-base font-medium mb-2">
              <Star className="w-5 h-5 ml-2" /> العلامة التجارية
            </h4>
            <div className="space-y-1">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center">
                  <Checkbox
                    checked={selectedBrand === brand}
                    onCheckedChange={(checked) => onBrandSelect(checked ? brand : null)}
                    className="ml-2"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FilterPanel;
