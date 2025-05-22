
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, RefreshCw, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export interface FilterValues {
  category: string;
  priceRange: [number, number];
  rating: number | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: FilterValues;
  priceRange: [number, number];
  setFilters: (filters: FilterValues) => void;
  resetFilters: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  priceRange,
  setFilters,
  resetFilters,
  searchTerm,
  setSearchTerm,
  onRefresh
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { toast } = useToast();
  
  const handleCategoryChange = (categoryId: string) => {
    setFilters({
      ...filters,
      category: categoryId
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters({
      ...filters,
      priceRange: [value[0], value[1]]
    });
  };

  const handleRatingChange = (rating: number | null) => {
    setFilters({
      ...filters,
      rating
    });
  };

  return (
    <>
      <section className="py-8 bg-white sticky top-0 z-30 border-b border-gray-200 shadow-sm">
        <div className="container-custom">
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-full md:w-auto flex-1 max-w-md">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-amazon-link focus:border-amazon-link focus:outline-none"
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
                className="flex items-center gap-2 py-3 px-4 bg-amazon-light border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                onClick={onRefresh}
              >
                <RefreshCw className="h-5 w-5 text-amazon-orange" />
                <span className="text-amazon-dark font-medium">تحديث</span>
              </motion.button>
              
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 py-3 px-4 bg-amazon-secondary text-white border border-amazon-secondary rounded-lg shadow-sm hover:bg-amazon-primary focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>تصفية النتائج</span>
                    {(filters.category !== 'all' || filters.rating !== null || 
                      filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                      <Badge className="bg-amazon-orange hover:bg-amazon-orange/90 mr-2">
                        تصفية نشطة
                      </Badge>
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
                            className="data-[state=checked]:bg-amazon-orange data-[state=checked]:border-amazon-orange"
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
                      
                      <div className="flex flex-wrap gap-2">
                        {[null, 5, 4, 3, 2, 1].map((rating, i) => (
                          <Badge 
                            key={i}
                            variant={filters.rating === rating ? "default" : "outline"}
                            className={`cursor-pointer ${filters.rating === rating ? 'bg-amazon-orange border-amazon-orange' : ''}`}
                            onClick={() => handleRatingChange(rating)}
                          >
                            {rating === null ? 'الكل' : `${rating}+`}
                            {rating !== null && (
                              <span className="mr-1 inline-flex">
                                {[...Array(rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
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
                        className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-white"
                      >
                        تطبيق التصفية
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
                className="text-xs text-amazon-link hover:text-amazon-orange hover:bg-transparent"
              >
                إعادة ضبط الكل
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;
