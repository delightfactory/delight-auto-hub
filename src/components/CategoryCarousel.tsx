import React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { categoryService } from '@/services/adminService';

interface CategoryCarouselProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ selectedCategory, onSelectCategory }) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  if (isLoading) return null;

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex space-x-4 px-4">
        <button
          onClick={() => onSelectCategory(null)}
          className="group flex flex-col items-center flex-shrink-0 px-4 py-2 focus:outline-none"
        >
          <div className="p-3 rounded-lg mb-1 bg-white border border-gray-200">
            <Icons.Tag className="h-8 w-8" />
          </div>
          <span className={`text-sm whitespace-nowrap transition-colors ${
            !selectedCategory ? 'text-delight-600 font-semibold' : 'text-gray-700'
          }`}>الكل</span>
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group flex flex-col items-center flex-shrink-0 px-4 py-2 focus:outline-none"
          >
            <div className="p-3 rounded-lg mb-1 bg-white border border-gray-200">
              {typeof cat.icon === 'string' && cat.icon.startsWith('http') ? (
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="h-8 w-8 object-cover rounded-md"
                />
              ) : (
                (() => {
                  const IconComp = (cat.icon && (Icons as any)[cat.icon]) ? (Icons as any)[cat.icon] : Icons.Tag;
                  return <IconComp className="h-8 w-8" />;
                })()
              )}
            </div>
            <span className={`text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat.id ? 'text-delight-600 font-semibold' : 'text-gray-700'
            }`}>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
