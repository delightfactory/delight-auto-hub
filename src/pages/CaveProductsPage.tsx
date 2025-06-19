import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { AlertCircle, ShoppingCart, Star, Filter, Package, Gem, ShieldCheck, Clock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks & context
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CaveParticles from '@/components/cave/CaveParticles';
import { useCaveAudio } from '@/components/cave/CaveAudioEffects';
import { CaveTitle, CaveIcon, CaveCard, CaveBadge, CaveButton } from '@/components/cave/CaveUI';
import EnhancedCaveHeader from '@/components/cave/EnhancedCaveHeader';
import EnhancedProductCard from '@/components/cave/EnhancedProductCard';
import { caveAnimations } from '@/components/cave/caveAnimations';
import CaveFilterDialog from '@/components/cave/CaveFilterDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Styles
import '@/styles/cave-game.css';
import '@/styles/cave-game-enhanced.css';

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
    const { addItem, items: cartItems } = useCart();
    const queryClient = useQueryClient();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [pointsRange, setPointsRange] = useState<[number, number]>([0, 1000]);
    const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
    const { playSound } = useCaveAudio();

    const { data: activeSession, isLoading: isLoadingSession } = useQuery({
        queryKey: ['cave-active-session', user?.id, sessionId],
        queryFn: () => sessionId ? caveService.getSessionById(sessionId) : caveService.getActiveUserSession(user?.id || ''),
        enabled: !!user?.id,
    });

    const { data: caveProducts, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['cave-products', selectedCategory, priceRange, pointsRange, selectedRarity],
        queryFn: () => ProductDataService.getCaveProducts(selectedCategory || undefined),
        enabled: !!activeSession,
    });
    
    const { data: caveCategories = [] } = useQuery({
        queryKey: ['cave-categories'],
        queryFn: () => ProductDataService.getCaveCategories(),
        enabled: !!activeSession,
    });
    // جلب بيانات الحدث المرتبط بالجلسة للتحقف الشراء
    const currentTotal = cartItems.filter(i => i.is_cave_purchase && i.session_id === sessionId).reduce((sum, i) => sum + (i.cave_price || 0) * i.quantity, 0);
    
    const sessionSpent = activeSession?.total_spent || 0;
     // existing spent from session

    const { data: activeEvent } = useQuery({
        queryKey: ['cave-event', activeSession?.event_id],
        queryFn: () => activeSession ? caveService.getEventById(activeSession.event_id) : Promise.resolve(null),
        enabled: !!activeSession,
    });

    const totalSpent = sessionSpent + currentTotal;
    const remainingCap = activeEvent ? activeEvent.purchase_cap - totalSpent : 0;
    const percentRemaining = activeEvent ? (remainingCap / activeEvent.purchase_cap) * 100 : 0;
    const [remainingTime, setRemainingTime] = useState<{ hours: number; minutes: number; seconds: number; total: number }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

    const endSessionMutation = useMutation({
        mutationFn: () => caveService.endSession(activeSession!.session_id, activeSession!.total_spent),
        onSuccess: () => {
            toast({ title: 'انتهت الجلسة', description: 'انتهى الوقت. جاري إعادة التوجيه...', variant: 'default' });
            queryClient.invalidateQueries({ queryKey: ['cave-active-session'] });
            navigate('/cave');
        },
        onError: (error: any) => {
            toast({ title: 'خطأ عند إنهاء الجلسة', description: (error as Error).message || 'حدث خطأ غير متوقع.', variant: 'destructive' });
            navigate('/cave');
        },
    });

    useEffect(() => {
        if (!activeSession) return;
        const timer = setInterval(() => {
            const expiryTime = new Date(activeSession.expires_at).getTime();
            const now = Date.now();
            const remainingMs = expiryTime - now;
            if (remainingMs <= 0) {
                clearInterval(timer);
                endSessionMutation.mutate();
                return;
            }
            setRemainingTime({
                hours: Math.floor(remainingMs / 3600000),
                minutes: Math.floor((remainingMs % 3600000) / 60000),
                seconds: Math.floor((remainingMs % 60000) / 1000),
                total: Math.floor(remainingMs / 1000) // إضافة إجمالي الثواني المتبقية
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeSession, endSessionMutation]);

    const handleAddToCart = (product: any) => {
        playSound('cart-add', 0.3);
        // تحقق من حد الكمية لكل منتج
        const existingQty = cartItems
            .filter(i => i.is_cave_purchase && i.id === product.id && i.session_id === sessionId)
            .reduce((sum, i) => sum + i.quantity, 0);
        if (product.cave_max_quantity !== undefined && existingQty >= product.cave_max_quantity) {
            toast({ title: `لا يمكنك إضافة أكثر من ${product.cave_max_quantity} قطع من هذا المنتج.`, variant: 'destructive' });
            return;
        }
        // تحقق من سقف قيمة الشراء للجلسة
        const currentTotal = cartItems
            .filter(i => i.is_cave_purchase && i.session_id === sessionId)
            .reduce((sum, i) => sum + (i.cave_price || 0) * i.quantity, 0);
        if (activeEvent && currentTotal + (product.cave_price || 0) > (activeEvent.purchase_cap || 0)) {
            const remaining = (activeEvent.purchase_cap || 0) - currentTotal;
            toast({ title: `رصيدك المتبقي: ${remaining} ج.م فقط.`, variant: 'destructive' });
            return;
        }
        // إضافة المنتج
        addItem({
            ...product,
            is_cave_purchase: true,
            session_id: sessionId || undefined,
        });
        toast({ title: 'تمت الإضافة إلى سلة المغارة', description: `تمت إضافة ${product.name} بنجاح.` });
    };


    if (isLoadingSession) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white cave-font-secondary">
                <Gem className="w-16 h-16 text-yellow-400 animate-pulse" />
                <p className="mt-4 text-lg tracking-wider">جاري فتح بوابات المغارة...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white cave-font-secondary relative overflow-x-hidden cave-enhanced-bg" dir="rtl">
            <div className="fixed inset-0 z-0 bg-[url('/images/cave-bg-dark.jpg')] bg-cover bg-center opacity-40"></div>
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
            <CaveParticles count={40} colors={['#FFD700', '#FDE047', '#FBBF24', '#F59E0B', '#FACC15']} />
            
            <div className="cave-container cave-spacing-md relative cave-enhanced-content">
                <EnhancedCaveHeader
                    session={activeSession}
                    event={activeEvent}
                    remainingTime={{
                        hours: remainingTime.hours,
                        minutes: remainingTime.minutes,
                        seconds: remainingTime.seconds
                    }}
                    purchaseLimit={{
                        remaining: remainingCap,
                        total: activeEvent?.purchase_cap || 0
                    }}
                    userPoints={200}
                />

                <div className="flex items-center justify-between pb-4 mb-8">
                    {/* عرض الفلتر الحالي للشاشات الكبيرة */}
                    <div className="hidden md:flex flex-wrap items-center gap-3 mb-4 px-4">
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
                        {caveCategories && caveCategories.map((category) => (
                            <CaveButton
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                                size="md"
                                className={`flex items-center gap-2 ${selectedCategory === category.id ? 'shadow-lg shadow-yellow-400/20' : ''}`}
                            >
                                {category.icon && <span className="text-yellow-400">{category.icon}</span>}
                                {category.name}
                            </CaveButton>
                        ))}
                    </div>
                    
                    {/* زر فتح مربع حوار الفلتر للشاشات الصغيرة */}
                    <div className="md:hidden w-full flex justify-center">
                        <CaveFilterDialog
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                            categories={caveCategories}
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            minPrice={0}
                            maxPrice={5000}
                            pointsRange={pointsRange}
                            onPointsChange={setPointsRange}
                            minPoints={0}
                            maxPoints={1000}
                            rarities={['common', 'rare', 'epic', 'legendary']}
                            selectedRarity={selectedRarity}
                            onRaritySelect={setSelectedRarity}
                            resetFilters={() => {
                                setSelectedCategory(null);
                                setPriceRange([0, 5000]);
                                setPointsRange([0, 1000]);
                                setSelectedRarity(null);
                            }}
                        />
                    </div>
                    
                    <Separator className="bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent my-4" />

                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedCategory && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {caveCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                            </Badge>
                        )}
                        {(priceRange[0] !== 0 || priceRange[1] !== 5000) && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {`السعر: ${priceRange[0]}-${priceRange[1]}`}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 5000])} />
                            </Badge>
                        )}
                        {(pointsRange[0] !== 0 || pointsRange[1] !== 1000) && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {`النقاط: ${pointsRange[0]}-${pointsRange[1]}`}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setPointsRange([0, 1000])} />
                            </Badge>
                        )}
                        {selectedRarity && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {selectedRarity}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRarity(null)} />
                            </Badge>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isLoadingProducts ? (
                        <div className="cave-grid">
                            {Array.from({length:9}).map((_,i)=>(
                                <div key={i} className="animate-pulse bg-gray-800/50 rounded-2xl h-40 border border-yellow-500/10"></div>
                            ))}
                        </div>
                    ) : (
                        <motion.div layout className="cave-grid">
                            {caveProducts?.filter((product: any) => {
                                // تطبيق فلتر السعر
                                if (product.cave_price < priceRange[0] || product.cave_price > priceRange[1]) {
                                    return false;
                                }
                                
                                // تطبيق فلتر النقاط المطلوبة
                                const requiredPoints = product.cave_required_points || 0;
                                if (requiredPoints < pointsRange[0] || requiredPoints > pointsRange[1]) {
                                    return false;
                                }
                                
                                // تطبيق فلتر الندرة
                                if (selectedRarity) {
                                    const productRarity = getRarity(product);
                                    if (productRarity.class !== selectedRarity) {
                                        return false;
                                    }
                                }
                                
                                return true;
                            }).map((product: any, index: number) => {
                                const cartQty = cartItems
            .filter(i => i.is_cave_purchase && i.id === product.id && i.session_id === sessionId)
            .reduce((sum, i) => sum + i.quantity, 0);
            return (
                <motion.div
                    key={product.id}
                    layout
                    initial={caveAnimations.fadeInUp.initial}
                    animate={caveAnimations.fadeInUp.animate}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                        ...caveAnimations.fadeInUp.transition,
                        delay: index * 0.05
                    }}
                >
                    <EnhancedProductCard
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        isInCart={cartQty > 0}
                        cartQuantity={cartQty}
                    />
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
