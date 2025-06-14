import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ShoppingCart, Star, Filter, Package, Gem, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks & context
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CaveParticles from '@/components/cave/CaveParticles';
import { useCaveAudio } from '@/components/cave/CaveAudioEffects';
import { CaveTitle, CaveIcon, CaveCard, CaveBadge, CaveButton } from '@/components/cave/CaveUI';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Services
import { caveService } from '@/services/caveService';
import { ProductDataService } from '@/services/productDataService';

// --- أدوات مساعدة ---

// أداة مساعدة لحساب حالة المخزون
const getStockStatus = (qty: number) => {
    if (qty <= 0) return { text: 'غير متوفر', color: 'text-red-400',bgColor: 'bg-red-900/30', borderColor: 'border-red-500/30' };
    if (qty < 10) return { text: 'كمية محدودة', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', borderColor: 'border-yellow-500/30' };
    if (qty < 50) return { text: 'مخزون منخفض', color: 'text-blue-400' , bgColor: 'bg-blue-900/30', borderColor: 'border-blue-500/30'};
    return { text: 'متوفر', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-500/30' };
};

// أداة لحساب ندرة المنتج بناءً على نسبة الخصم أو نقاطه
const getRarity = (product: any) => {
    const discount = product.originalPrice ? 1 - (product.cave_price / parseFloat(product.originalPrice)) : 0;
    const points = product.cave_required_points ?? 0;
    const score = discount * 100 + points / 100;
    if (score > 80) return { label: 'أسطوري', class: 'legendary' };
    if (score > 50) return { label: 'ملحمي', class: 'epic' };
    if (score > 25) return { label: 'نادر', class: 'rare' };
    return { label: 'عادي', class: 'common' };
};

// --- المكون الرئيسي ---
const CaveProductsPage: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addItem } = useCart();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { playSound } = useCaveAudio();

    const { data: activeSession, isLoading: isLoadingSession } = useQuery({
        queryKey: ['cave-active-session', user?.id, sessionId],
        queryFn: () => sessionId ? caveService.getSessionById(sessionId) : caveService.getActiveUserSession(user?.id || ''),
        enabled: !!user?.id,
    });

    const { data: caveProducts, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['cave-products', selectedCategory],
        queryFn: () => ProductDataService.getCaveProducts(selectedCategory || undefined),
        enabled: !!activeSession,
    });
    
    const { data: caveCategories } = useQuery({
        queryKey: ['cave-categories'],
        queryFn: () => ProductDataService.getCaveCategories(),
        enabled: !!activeSession,
    });

    const [remainingTime, setRemainingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!activeSession) return;
        const timer = setInterval(() => {
            const expiryTime = new Date(activeSession.expires_at).getTime();
            const remaining = Math.max(0, expiryTime - Date.now());
            setRemainingTime({
                hours: Math.floor(remaining / 3600000),
                minutes: Math.floor((remaining % 3600000) / 60000),
                seconds: Math.floor((remaining % 60000) / 1000),
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeSession]);

    const handleAddToCart = (product: any) => {
        playSound('cart-add', 0.3);
        
        if (product.cave_max_quantity <= 0) {
            toast({ title: "المنتج غير متوفر", variant: "destructive" });
            return;
        }
        addItem(product);
        toast({ title: "تمت الإضافة إلى السلة", description: `تمت إضافة ${product.name} بنجاح.` });
    };

    if (isLoadingSession) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white font-cairo">
                <Gem className="w-16 h-16 text-yellow-400 animate-pulse" />
                <p className="mt-4 text-lg tracking-wider">جاري فتح بوابات المغارة...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-cairo relative overflow-x-hidden" dir="rtl">
            <div className="fixed inset-0 z-0 bg-[url('/images/cave-bg-dark.jpg')] bg-cover bg-center opacity-30"></div>
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
            <CaveParticles count={30} colors={['#FFD700', '#FDE047', '#FBBF24', '#F59E0B']} />
            
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                <header className="text-center mb-12 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="relative inline-block"
                    >
                        <CaveTitle level={1} className="text-4xl md:text-5xl font-black mb-2">
                            كنوز المغارة
                        </CaveTitle>
                        <div className="absolute -top-6 -right-6 rotate-12 hidden sm:block">
                            <CaveIcon type="gem" size="lg" animate={true} />
                        </div>
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-base text-yellow-200/80 max-w-3xl mx-auto"
                    >
                        مجموعة حصرية من المنتجات النفيسة، متاحة لفترة محدودة وبأسعار لا تضاهى. استكشف العروض قبل أن تختفي!
                    </motion.p>
                </header>

                {/* --- Countdown Timer Improved --- */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-12 max-w-2xl mx-auto"
                >
                    <div className="w-full p-4 flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-gray-900/50 backdrop-blur-sm">
                        <div className="flex items-center">
                            <ShieldCheck className="w-8 h-8 text-yellow-400" />
                            <div className="mr-3">
                                <h2 className="font-bold text-base text-yellow-100">جلستك محمية</h2>
                                <p className="text-xs text-yellow-200/70">العروض تنتهي خلال:</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 font-mono text-xl font-bold text-white bg-black/20 px-4 py-2 rounded-lg border border-yellow-500/30" dir="ltr">
                            <span>{String(remainingTime.hours).padStart(2, '0')}</span>
                            <span className="text-yellow-400/80 -mt-1">:</span>
                            <span>{String(remainingTime.minutes).padStart(2, '0')}</span>
                            <span className="text-yellow-400/80 -mt-1">:</span>
                            <span>{String(remainingTime.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </motion.div>

                {caveCategories && (
                    <div className="pb-4 mb-8">
                        <div className="flex flex-wrap justify-center items-center gap-3 mb-4 px-4">
                            <CaveButton
                                onClick={() => setSelectedCategory(null)}
                                variant={!selectedCategory ? 'primary' : 'outline'}
                                size="md"
                                icon={<Filter className="w-4 h-4" />}
                                iconPosition="start"
                                className={!selectedCategory ? 'shadow-lg shadow-yellow-400/20' : ''}
                            >
                                كل الكنوز
                            </CaveButton>
                            {caveCategories.filter(cat => cat.length < 30).map((category: string) => (
                                <CaveButton
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    variant={selectedCategory === category ? 'primary' : 'outline'}
                                    size="md"
                                    className={selectedCategory === category ? 'shadow-lg shadow-yellow-400/20' : ''}
                                >
                                    {category}
                                </CaveButton>
                            ))}
                        </div>
                        <Separator className="bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-4" />
                    </div>
                )}

                <AnimatePresence>
                    {isLoadingProducts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({length:9}).map((_,i)=>(
                                <div key={i} className="animate-pulse bg-gray-800/50 rounded-2xl h-40 border border-yellow-500/10"></div>
                            ))}
                        </div>
                    ) : (
                        <motion.div layout className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {caveProducts?.map((product: any, index: number) => {
                                const rarity = getRarity(product);
                                const stockStatus = getStockStatus(product.cave_max_quantity);
                                const discount = product.originalPrice ? Math.round(100 - (product.cave_price / parseFloat(product.originalPrice.replace(/[^0-9.]/g, ''))) * 100) : 0;
                                const originalPrice = product.originalPrice ? parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) : product.price;
                                const savings = originalPrice - product.cave_price;
                                
                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <div 
                                            className={`
                                                group w-full flex flex-row overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br 
                                                from-gray-800/90 to-gray-900/90 transition-all duration-300
                                                ${rarity.class === 'legendary' || rarity.class === 'epic' ? 'hover:shadow-lg hover:shadow-yellow-400/20' : ''}
                                                ${rarity.class === 'legendary' ? 'hover:-translate-y-1' : ''}
                                            `}
                                        >
                                            {/* --- قسم المحتوى (الجانب الأيمن) --- */}
                                            <div className="p-2 flex flex-col flex-grow w-2/3">
                                                <div className='flex-grow'>
                                                    <h3 className="text-sm font-bold text-yellow-100 cave-game-text-glow line-clamp-1">{product.name}</h3>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-8">{product.description}</p>
                                                </div>
                                                
                                                <div className="mt-auto">
                                                    <div className="flex justify-end items-center my-1.5">
                                                        <Badge variant="outline" className={`flex items-center ${stockStatus.color} ${stockStatus.bgColor} ${stockStatus.borderColor} px-2 py-0.5 text-xs`}>
                                                            <Package className="w-2.5 h-2.5 ml-1"/>
                                                            {stockStatus.text}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <Separator className="bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-1.5" />

                                                    <div className="flex-shrink-0 flex items-end justify-between">
                                                        <div className="flex flex-col items-start">
                                                        <span className="text-xs text-yellow-200/70">السعر</span>
                                                        <div className="text-lg font-black text-yellow-400 cave-game-text-glow flex items-center">
                                                            <CaveIcon type="coin" size="sm" className="ml-1" />
                                                            {product.cave_price}
                                                        </div>
                                                        {discount > 0 && (
                                                            <div className="text-xs text-gray-400 line-through">{product.price} ج.م</div>
                                                        )}
                                                        </div>
                                                        
                                                        <CaveButton 
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.cave_max_quantity <= 0}
                                                            icon={<ShoppingCart className="w-4 h-4" />}
                                                            soundEffect="coin"
                                                            glowEffect
                                                            size="sm"
                                                            className="transition-all duration-300 group-hover:translate-y-[-2px] text-sm"
                                                        >
                                                            إضافة
                                                        </CaveButton>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- قسم الصورة (الجانب الأيسر) --- */}
                                            <div className="relative w-1/3 flex-shrink-0 aspect-square">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400/1a1a1a/333?text=خطأ'; }} 
                                                />
                                                
                                                {/* شارة الخصم المحسنة */}
                                                {discount > 0 && (
                                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold py-1 px-2 text-xs shadow-lg rounded-md z-10 transform transition-transform group-hover:scale-110">
                                                        خصم {discount}%
                                                    </div>
                                                )}

                                                {/* التقييم في الأسفل */}
                                                <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center gap-1 bg-gray-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-yellow-500/30">
                                                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                                                    <span className="font-bold text-xs text-white">{product.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CaveProductsPage;
