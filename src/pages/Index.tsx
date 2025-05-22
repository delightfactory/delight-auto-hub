
import React, { useState, useEffect } from 'react';
import { ProductsAPI } from '@/services/productsAPI';
import { Product } from '@/types/db';
import Hero from '@/components/Hero';
import SectionHeading from '@/components/SectionHeading';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const products = await ProductsAPI.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">منتجاتنا المميزة</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اكتشف مجموعتنا من المنتجات المميزة للعناية بالسيارات. منتجات عالية الجودة وبأسعار تنافسية.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              // Show loading placeholders
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : featuredProducts?.length > 0 ? (
              // Show actual products if available
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description || ''}
                  image={(product.images && product.images[0]) || 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products'}
                  price={`${product.price} ر.س`}
                  rating={4.5}
                />
              ))
            ) : (
              // No products found state
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">لا توجد منتجات مميزة متاحة حالياً</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* New Products Section */}
      <FeaturedProducts type="new" title="وصل حديثاً" subtitle="أحدث منتجات العناية بالسيارات في السوق" />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <SectionHeading
            title="تواصل معنا"
            subtitle="لديك استفسارات؟ تواصل مع فريقنا للحصول على المساعدة."
            center
          />
          <ContactForm />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
