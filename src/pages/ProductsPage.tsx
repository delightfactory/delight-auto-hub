
import React from 'react';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample product data
const products = {
  exterior: [
    {
      id: "car-shampoo",
      name: "شامبو السيارات الفاخر",
      description: "شامبو مركز عالي الجودة للعناية بسيارتك والحفاظ على لمعانها الطبيعي مع حماية طويلة الأمد.",
      image: "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: "ceramic-coating",
      name: "طلاء سيراميك للحماية",
      description: "طلاء سيراميك متطور يوفر حماية فائقة لطلاء السيارة مع تعزيز اللمعان والمقاومة للماء والأوساخ.",
      image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
    },
    {
      id: "quick-detailer",
      name: "ملمع سريع للسيارات",
      description: "ملمع سريع يعيد اللمعان للسيارة في دقائق ويزيل الغبار والأوساخ الخفيفة بسهولة.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
  ],
  interior: [
    {
      id: "interior-cleaner",
      name: "منظف المقصورة الداخلية",
      description: "منظف متخصص للعناية بالأسطح الداخلية للسيارة مع حماية من الأشعة فوق البنفسجية.",
      image: "https://images.unsplash.com/photo-1597766332420-6d25196201bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: "leather-conditioner",
      name: "مرطب ومنظف الجلود",
      description: "مرطب ومنظف للأسطح الجلدية في السيارة يعيد الحيوية ويحميها من التشققات والجفاف.",
      image: "https://images.unsplash.com/photo-1547731030-cd126f44e9c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: "air-freshener",
      name: "معطر جو السيارة",
      description: "معطر جو السيارة بروائح طبيعية منعشة تدوم طويلاً مع تقنية إزالة الروائح الكريهة.",
      image: "https://images.unsplash.com/photo-1610479886352-b1954ea7a5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
  ],
  engine: [
    {
      id: "engine-cleaner",
      name: "منظف المحرك",
      description: "منظف قوي للمحرك يزيل الزيوت والشحوم المتراكمة بكفاءة عالية.",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    {
      id: "engine-protector",
      name: "حماية وتلميع المحرك",
      description: "منتج متخصص لحماية وتلميع أجزاء المحرك وإعطائها مظهراً احترافياً.",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1483&q=80"
    },
  ],
  waxes: [
    {
      id: "premium-wax",
      name: "شمع سيارات فاخر",
      description: "شمع عالي الجودة يمنح سيارتك لمعاناً فائقاً وحماية تدوم لفترات طويلة.",
      image: "https://images.unsplash.com/photo-1547841051-7d90e2c9a52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    {
      id: "spray-wax",
      name: "شمع بخاخ سريع",
      description: "شمع بخاخ سريع التطبيق للاستخدام بين غسلات السيارة الكاملة.",
      image: "https://images.unsplash.com/photo-1596219857574-f40afd3e4286?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
  ],
  accessories: [
    {
      id: "tire-shine",
      name: "ملمع إطارات بتقنية النانو",
      description: "ملمع إطارات بتقنية النانو يمنح إطارات سيارتك مظهرًا احترافيًا ولامعًا مع حماية من العوامل الجوية.",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80"
    },
    {
      id: "microfiber-cloths",
      name: "مناشف مايكروفايبر",
      description: "مناشف مايكروفايبر عالية الجودة للتنظيف والتجفيف والتلميع بدون خدوش.",
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
  ]
};

const ProductsPage: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="منتجاتنا"
        subtitle="مجموعة متكاملة من منتجات العناية بالسيارات عالية الجودة لتلبية جميع احتياجات سيارتك"
        backgroundImage="https://images.unsplash.com/photo-1591439657848-9f6677a7e6ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      />
      
      <section className="section bg-white">
        <div className="container-custom">
          <SectionHeading 
            title="اكتشف منتجاتنا"
            subtitle="مجموعة شاملة من منتجات العناية عالية الجودة لكل جزء من سيارتك"
            center
          />
          
          <Tabs defaultValue="exterior" className="w-full">
            <TabsList className="flex flex-wrap justify-center mb-8 space-x-2 rtl:space-x-reverse">
              <TabsTrigger value="exterior">العناية الخارجية</TabsTrigger>
              <TabsTrigger value="interior">العناية الداخلية</TabsTrigger>
              <TabsTrigger value="engine">العناية بالمحرك</TabsTrigger>
              <TabsTrigger value="waxes">الشمع والملمعات</TabsTrigger>
              <TabsTrigger value="accessories">اكسسوارات العناية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exterior" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.exterior.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="interior" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.interior.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="engine" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.engine.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="waxes" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.waxes.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="accessories" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.accessories.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
