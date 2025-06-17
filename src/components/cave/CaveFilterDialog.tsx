import React, { useState, useMemo } from 'react';
import { Filter, X, Search, Gem, DollarSign, Tag, Star, Package, SlidersHorizontal, BadgePercent, Sparkles } from 'lucide-react';

// UI Components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Cave Components
import { CaveButton, CaveIcon } from '@/components/cave/CaveUI';

// Types
import { Category } from '@/types/db';

interface CaveFilterDialogProps {
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
  categories: Category[];
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
  minPrice?: number;
  maxPrice?: number;
  pointsRange?: [number, number];
  onPointsChange?: (range: [number, number]) => void;
  minPoints?: number;
  maxPoints?: number;
  rarities?: string[];
  selectedRarity?: string | null;
  onRaritySelect?: (rarity: string | null) => void;
  resetFilters?: () => void;
}

// وظيفة مساعدة لتنسيق اسم الفئة
const formatCategoryName = (name: string): string => {
  // إذا كان الاسم طويلاً جدًا، نقصره
  if (name.length > 25) {
    return `${name.substring(0, 22)}...`;
  }
  
  return name;
};

// وظيفة مساعدة للحصول على أيقونة الفئة
const getCategoryIcon = (category: Category) => {
  // استخدام الأيقونة المخصصة إذا كانت متوفرة
  if (category.icon) {
    return <span className="text-yellow-400">{category.icon}</span>;
  }
  
  // أيقونة افتراضية
  return <Tag className="h-4 w-4 text-yellow-400" />;
};

export const CaveFilterDialog: React.FC<CaveFilterDialogProps> = ({
  selected,
  onSelect,
  categories,
  priceRange = [0, 5000],
  onPriceChange,
  minPrice = 0,
  maxPrice = 5000,
  pointsRange = [0, 1000],
  onPointsChange,
  minPoints = 0,
  maxPoints = 1000,
  rarities = ['common', 'rare', 'epic', 'legendary'],
  selectedRarity = null,
  onRaritySelect,
  resetFilters,
}) => {
  // حالة البحث
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // حالات الفلتر المحلية
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);
  const [localPointsRange, setLocalPointsRange] = useState<[number, number]>(pointsRange);
  const [localSelectedRarity, setLocalSelectedRarity] = useState<string | null>(selectedRarity);
  
  // فلترة الفئات بناءً على البحث
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    return categories.filter(category => {
      const displayName = category.name;
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [categories, searchQuery]);
  
  // الحصول على الفئة المحددة
  const selectedCategory = useMemo(() => {
    if (!selected) return null;
    return categories.find(cat => cat.id === selected) || null;
  }, [selected, categories]);
  
  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selected) count++;
    if (localSelectedRarity) count++;
    if (localPriceRange[0] > minPrice || localPriceRange[1] < maxPrice) count++;
    if (localPointsRange[0] > minPoints || localPointsRange[1] < maxPoints) count++;
    return count;
  }, [selected, localSelectedRarity, localPriceRange, localPointsRange, minPrice, maxPrice, minPoints, maxPoints]);
  
  // تطبيق الفلاتر
  const applyFilters = () => {
    if (onPriceChange) onPriceChange(localPriceRange);
    if (onPointsChange) onPointsChange(localPointsRange);
    if (onRaritySelect) onRaritySelect(localSelectedRarity);
  };
  
  // إعادة تعيين الفلاتر
  const handleResetFilters = () => {
    onSelect(null);
    setLocalPriceRange([minPrice, maxPrice]);
    setLocalPointsRange([minPoints, maxPoints]);
    setLocalSelectedRarity(null);
    setSearchQuery('');
    if (resetFilters) resetFilters();
    if (onPriceChange) onPriceChange([minPrice, maxPrice]);
    if (onPointsChange) onPointsChange([minPoints, maxPoints]);
    if (onRaritySelect) onRaritySelect(null);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <CaveButton 
          variant="outline" 
          className="flex items-center gap-2 rounded-full shadow-sm transition-all h-10 px-4 py-2"
          icon={<Filter className="h-4 w-4" />}
          iconPosition="start"
        >
          فلترة
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-white bg-yellow-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </CaveButton>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="p-0 w-[75%] sm:max-w-[320px] border-l shadow-lg flex flex-col bg-gray-900 text-yellow-50 border-yellow-900/50"
        style={{ height: '80vh', top: '50%', transform: 'translateY(-50%)' }}
      >
        <SheetHeader className="px-3 py-2 border-b border-yellow-900/30 bg-black/40 sticky top-0 z-10 flex flex-row justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-yellow-500" />
            <SheetTitle className="text-base font-semibold text-yellow-100">فلترة الكنوز</SheetTitle>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-black bg-yellow-500 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="h-7 text-xs text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900/30"
              >
                إعادة ضبط
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900/30">
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">إغلاق</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full overflow-y-auto pb-16">
            <div className="p-3">
              {/* عرض الفلاتر النشطة */}
              {activeFiltersCount > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-yellow-300 mb-2">الفلاتر النشطة</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected && selectedCategory && (
                      <Badge 
                        variant="outline" 
                        className="bg-yellow-900/30 text-yellow-100 border-yellow-500/30 px-2 py-1 flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3 text-yellow-400" />
                        {selectedCategory.name}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-900/30 rounded-full"
                          onClick={() => onSelect(null)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                    
                    {localSelectedRarity && (
                      <Badge 
                        variant="outline" 
                        className="bg-purple-900/30 text-purple-100 border-purple-500/30 px-2 py-1 flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        {localSelectedRarity === 'legendary' ? 'أسطوري' : 
                         localSelectedRarity === 'epic' ? 'ملحمي' : 
                         localSelectedRarity === 'rare' ? 'نادر' : 'عادي'}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 rounded-full"
                          onClick={() => setLocalSelectedRarity(null)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                    
                    {(localPriceRange[0] > minPrice || localPriceRange[1] < maxPrice) && (
                      <Badge 
                        variant="outline" 
                        className="bg-green-900/30 text-green-100 border-green-500/30 px-2 py-1 flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3 text-green-400" />
                        {localPriceRange[0]} - {localPriceRange[1]}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 text-green-300 hover:text-green-100 hover:bg-green-900/30 rounded-full"
                          onClick={() => setLocalPriceRange([minPrice, maxPrice])}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                    
                    {(localPointsRange[0] > minPoints || localPointsRange[1] < maxPoints) && (
                      <Badge 
                        variant="outline" 
                        className="bg-blue-900/30 text-blue-100 border-blue-500/30 px-2 py-1 flex items-center gap-1"
                      >
                        <Gem className="h-3 w-3 text-blue-400" />
                        {localPointsRange[0]} - {localPointsRange[1]}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 text-blue-300 hover:text-blue-100 hover:bg-blue-900/30 rounded-full"
                          onClick={() => setLocalPointsRange([minPoints, maxPoints])}
                        >
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                  <Separator className="bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-4" />
                </div>
              )}
              
              {/* خيارات الفلترة */}
              <Accordion type="multiple" defaultValue={['category']} className="space-y-4">
                {/* فلتر الفئات */}
                <AccordionItem value="category" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-medium text-yellow-300 hover:text-yellow-100 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-yellow-400" />
                      <span>تصفية حسب الفئة</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <div className="space-y-2">
                      {/* حقل البحث */}
                      <div className="relative mb-3">
                        <Input
                          placeholder="ابحث عن فئة..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-black/20 border-yellow-900/30 text-yellow-100 placeholder:text-yellow-100/50 pr-9"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500/70" />
                      </div>
                      
                      <CaveButton
                        onClick={() => onSelect(null)}
                        variant={!selected ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full justify-start mb-2"
                      >
                        كل الكنوز
                      </CaveButton>
                      
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <CaveButton
                            key={category.id}
                            onClick={() => onSelect(category.id)}
                            variant={selected === category.id ? 'primary' : 'outline'}
                            size="sm"
                            className="w-full justify-start mb-1 flex items-center gap-2"
                            title={category.description || category.name}
                          >
                            {getCategoryIcon(category)}
                            {formatCategoryName(category.name)}
                          </CaveButton>
                        ))
                      ) : (
                        <div className="text-yellow-500/70 text-sm text-center py-2">
                          لا توجد فئات مطابقة
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* فلتر السعر */}
                <AccordionItem value="price" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-medium text-yellow-300 hover:text-yellow-100 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      <span>تصفية حسب السعر</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pt-2">
                        <Slider
                          defaultValue={localPriceRange}
                          min={minPrice}
                          max={maxPrice}
                          step={10}
                          value={localPriceRange}
                          onValueChange={(value) => setLocalPriceRange(value as [number, number])}
                          className="my-6"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-yellow-300 mb-1 block">من</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={localPriceRange[0]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= minPrice && value <= localPriceRange[1]) {
                                  setLocalPriceRange([value, localPriceRange[1]]);
                                }
                              }}
                              className="bg-black/20 border-yellow-900/30 text-yellow-100 pr-8"
                            />
                            <CaveIcon type="coin" size="sm" className="absolute left-2 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-yellow-300 mb-1 block">إلى</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={localPriceRange[1]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value <= maxPrice && value >= localPriceRange[0]) {
                                  setLocalPriceRange([localPriceRange[0], value]);
                                }
                              }}
                              className="bg-black/20 border-yellow-900/30 text-yellow-100 pr-8"
                            />
                            <CaveIcon type="coin" size="sm" className="absolute left-2 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* فلتر النقاط المطلوبة */}
                <AccordionItem value="points" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-medium text-yellow-300 hover:text-yellow-100 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Gem className="h-4 w-4 text-blue-400" />
                      <span>تصفية حسب النقاط المطلوبة</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pt-2">
                        <Slider
                          defaultValue={localPointsRange}
                          min={minPoints}
                          max={maxPoints}
                          step={10}
                          value={localPointsRange}
                          onValueChange={(value) => setLocalPointsRange(value as [number, number])}
                          className="my-6"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-yellow-300 mb-1 block">من</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={localPointsRange[0]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= minPoints && value <= localPointsRange[1]) {
                                  setLocalPointsRange([value, localPointsRange[1]]);
                                }
                              }}
                              className="bg-black/20 border-yellow-900/30 text-yellow-100 pr-8"
                            />
                            <Gem className="h-4 w-4 text-blue-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-yellow-300 mb-1 block">إلى</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={localPointsRange[1]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value <= maxPoints && value >= localPointsRange[0]) {
                                  setLocalPointsRange([localPointsRange[0], value]);
                                }
                              }}
                              className="bg-black/20 border-yellow-900/30 text-yellow-100 pr-8"
                            />
                            <Gem className="h-4 w-4 text-blue-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* فلتر الندرة */}
                <AccordionItem value="rarity" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-medium text-yellow-300 hover:text-yellow-100 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>تصفية حسب الندرة</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="rarity-all" 
                          checked={!localSelectedRarity}
                          onCheckedChange={() => setLocalSelectedRarity(null)}
                          className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor="rarity-all"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-100"
                        >
                          كل الندرات
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="rarity-common" 
                          checked={localSelectedRarity === 'common'}
                          onCheckedChange={(checked) => setLocalSelectedRarity(checked ? 'common' : null)}
                          className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor="rarity-common"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-100"
                        >
                          عادي
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="rarity-rare" 
                          checked={localSelectedRarity === 'rare'}
                          onCheckedChange={(checked) => setLocalSelectedRarity(checked ? 'rare' : null)}
                          className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor="rarity-rare"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-100"
                        >
                          نادر
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="rarity-epic" 
                          checked={localSelectedRarity === 'epic'}
                          onCheckedChange={(checked) => setLocalSelectedRarity(checked ? 'epic' : null)}
                          className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor="rarity-epic"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-100"
                        >
                          ملحمي
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id="rarity-legendary" 
                          checked={localSelectedRarity === 'legendary'}
                          onCheckedChange={(checked) => setLocalSelectedRarity(checked ? 'legendary' : null)}
                          className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor="rarity-legendary"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-100"
                        >
                          أسطوري
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </div>
        
        <SheetFooter className="border-t border-yellow-900/30 p-3 bg-black/40 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-[10001] shadow-md">
          <div className="flex justify-between w-full">
            <SheetClose asChild>
              <CaveButton variant="outline" size="sm">
                إلغاء
              </CaveButton>
            </SheetClose>
            <SheetClose asChild>
              <CaveButton 
                size="sm"
                onClick={applyFilters}
              >
                تطبيق
              </CaveButton>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CaveFilterDialog;