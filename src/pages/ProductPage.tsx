
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ProductsAPI } from '@/services/productsAPI';
import { Product } from '@/types/db';
import PageLoader from '@/components/PageLoader';
import { useCart } from '@/context/CartContext';
import { 
  Star, 
  Truck, 
  Shield, 
  ArrowRight, 
  Plus, 
  Minus, 
  Check,
  ImageOff,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  const { addItem, items } = useCart();
  
  const isInCart = items.some(item => item.id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!id) throw new Error('معرف المنتج غير صالح');
        
        const data = await ProductsAPI.getProductById(id);
        
        if (!data) {
          throw new Error('لم يتم العثور على المنتج');
        }
        
        console.log("Fetched product: ", data);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المنتج');
        toast({
          title: "خطأ",
          description: "تعذر تحميل بيانات المنتج",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: `${product.price} ر.س`,
      image: product.images && product.images.length > 0 ? 
        product.images[0] : 
        'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products',
      quantity
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${product.name} إلى سلة التسوق بنجاح.`,
    });
  };
  
  const incrementQuantity = () => {
    if (product?.stock && quantity >= product.stock) {
      toast({
        title: "تنبيه",
        description: "لقد وصلت إلى الحد الأقصى المتاح في المخزون",
        variant: "destructive"
      });
      return;
    }
    setQuantity(q => q + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };
  
  if (isLoading) {
    return <PageLoader message="جاري تحميل المنتج..." />;
  }
  
  if (error || !product) {
    return (
      <div className="container-custom py-16">
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="mb-6">{error || 'لم يتم العثور على المنتج المطلوب'}</p>
          <Link to="/products">
            <Button>العودة إلى المنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-amazon-link">الرئيسية</Link>
            <ArrowRight className="h-3 w-3 mx-2 rtl:rotate-180" />
            <Link to="/products" className="hover:text-amazon-link">المنتجات</Link>
            <ArrowRight className="h-3 w-3 mx-2 rtl:rotate-180" />
            <span className="font-medium text-gray-800">{product.name}</span>
          </div>
        </div>
      </div>
      
      {/* Product details */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[activeImageIndex]} 
                  alt={product.name} 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageOff size={60} className="mb-2" />
                  <span>لا توجد صورة للمنتج</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 space-x-reverse overflow-auto pb-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 ${
                      activeImageIndex === index ? 'border-amazon-orange' : 'border-gray-200'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - صورة ${index + 1}`} 
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Delight+Car+Products';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < 4 ? 'fill-amazon-orange text-amazon-orange' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="mx-2 text-sm text-gray-500">4.0</span>
              <span className="text-sm text-amazon-link">({product.reviews || 0} تقييم)</span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              {product.discount_price ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-amazon-price">
                    {product.discount_price} ر.س
                  </span>
                  <span className="mr-3 text-lg text-gray-400 line-through">
                    {product.price} ر.س
                  </span>
                  <span className="mr-3 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                    خصم {Math.round((1 - (product.discount_price / product.price)) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-amazon-price">
                  {product.price} ر.س
                </span>
              )}
              <p className="text-sm text-gray-500 mt-1">
                السعر شامل الضريبة
              </p>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">الوصف</h3>
              <p className="text-gray-600">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
              </p>
            </div>
            
            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">المميزات</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">الكمية</h3>
              <div className="flex items-center">
                <button
                  onClick={decrementQuantity}
                  className="p-2 border border-gray-300 rounded-r"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 border-t border-b border-gray-300 w-16 text-center">
                  {quantity}
                </div>
                <button
                  onClick={incrementQuantity}
                  className="p-2 border border-gray-300 rounded-l"
                  disabled={product.stock !== undefined && quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {product.stock !== undefined && (
                <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 
                    ? `متوفر في المخزون (${product.stock} قطعة)`
                    : 'غير متوفر حالياً'
                  }
                </p>
              )}
            </div>
            
            {/* Add to cart */}
            <div className="mt-auto">
              <Button 
                className="w-full py-6 amazon-btn-primary text-lg"
                onClick={handleAddToCart}
                disabled={isInCart || (product.stock !== undefined && product.stock <= 0)}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                {isInCart 
                  ? 'تمت الإضافة إلى السلة' 
                  : product.stock === 0 
                    ? 'غير متوفر' 
                    : 'إضافة إلى السلة'
                }
              </Button>
            </div>
            
            {/* Shipping info */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-amazon-orange ml-2" />
                <span className="text-sm">شحن سريع متوفر</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-amazon-orange ml-2" />
                <span className="text-sm">ضمان جودة المنتج</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
