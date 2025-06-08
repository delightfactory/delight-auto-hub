import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WishlistService } from '@/services/wishlistService';
import { ProductDataService, ProductDisplay } from '@/services/productDataService';
import { VirtualizedProductGrid } from '@/components/performance/VirtualizedProductGrid';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '@/components/common/LoadingIndicator';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: favorites, isLoading, error } = useQuery<ProductDisplay[], Error>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const ids = await WishlistService.getFavorites();
      const prods = await Promise.all(
        ids.map((id) => ProductDataService.getProductById(id))
      );
      return prods.filter((p): p is ProductDisplay => p !== null);
    },
  });

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ أثناء جلب المفضلات. الرجاء المحاولة مرة أخرى.
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        لا توجد منتجات في المفضلة.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">المفضلة</h1>
      <VirtualizedProductGrid
        products={favorites}
        onProductClick={(product) => navigate(`/products/${product.id}`)}
        columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
        gap={4}
        estimateSize={300}
        useWindowScroll={true}
        className="mt-4"
      />
    </div>
  );
};

export default FavoritesPage;
