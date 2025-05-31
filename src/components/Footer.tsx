
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  ArrowRight,
  Heart,
  ChevronUp,
  Clock,
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 pt-16 pb-8 overflow-hidden">
      {/* زخارف خلفية بسيطة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-delight-200/30 blur-3xl"></div>
        <div className="absolute -left-24 top-1/2 w-80 h-80 rounded-full bg-delight-100/30 blur-3xl"></div>
      </div>
      
      {/* شريط المميزات */}
      <div className="container-custom relative z-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 p-6 md:p-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col items-center text-center p-3 relative group">
            <div className="w-14 h-14 rounded-full bg-delight-50 flex items-center justify-center mb-3 group-hover:bg-delight-100 transition-all duration-300">
              <Truck className="w-6 h-6 text-delight-500" />
            </div>
            <h4 className="font-medium text-base mb-1 text-gray-800">شحن سريع</h4>
            <p className="text-gray-500 text-sm">لجميع أنحاء المملكة</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-3 relative group">
            <div className="w-14 h-14 rounded-full bg-delight-50 flex items-center justify-center mb-3 group-hover:bg-delight-100 transition-all duration-300">
              <CreditCard className="w-6 h-6 text-delight-500" />
            </div>
            <h4 className="font-medium text-base mb-1 text-gray-800">دفع آمن</h4>
            <p className="text-gray-500 text-sm">طرق دفع متعددة</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-3 relative group">
            <div className="w-14 h-14 rounded-full bg-delight-50 flex items-center justify-center mb-3 group-hover:bg-delight-100 transition-all duration-300">
              <Shield className="w-6 h-6 text-delight-500" />
            </div>
            <h4 className="font-medium text-base mb-1 text-gray-800">ضمان الجودة</h4>
            <p className="text-gray-500 text-sm">منتجات عالية الجودة</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-3 relative group">
            <div className="w-14 h-14 rounded-full bg-delight-50 flex items-center justify-center mb-3 group-hover:bg-delight-100 transition-all duration-300">
              <Clock className="w-6 h-6 text-delight-500" />
            </div>
            <h4 className="font-medium text-base mb-1 text-gray-800">دعم فني</h4>
            <p className="text-gray-500 text-sm">على مدار الساعة</p>
          </div>
        </div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* معلومات الشركة والنشرة البريدية */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col space-y-4">
              <div className="inline-block">
                <div className="text-3xl font-display font-bold">
                  <span className="text-delight-600">
                    DELIGHT
                  </span>
                  <div className="mt-1 w-16 h-0.5 bg-delight-500"></div>
                </div>
              </div>
              <p className="text-gray-600 max-w-md text-base leading-relaxed">
                شركة متخصصة في صناعة وتوزيع منتجات العناية بالسيارات ذات الجودة العالية لضمان الحماية والعناية المثالية بمركبتك.
              </p>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800">
                انضم لنشرتنا البريدية
              </h4>
              <p className="text-gray-600 text-sm">احصل على آخر العروض والمنتجات الجديدة</p>
              <div className="flex gap-2 max-w-md">
                <Input 
                  type="email" 
                  placeholder="البريد الإلكتروني" 
                  className="bg-white border-gray-300 focus:border-delight-500 h-10 text-sm" 
                />
                <Button className="bg-delight-500 hover:bg-delight-600 h-10 px-4 text-sm font-medium">
                  اشتراك
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                تابعنا
              </h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-delight-100 transition-colors flex items-center justify-center group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-600 group-hover:text-delight-500" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-delight-100 transition-colors flex items-center justify-center group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-600 group-hover:text-delight-500" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-delight-100 transition-colors flex items-center justify-center group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-gray-600 group-hover:text-delight-500" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-delight-100 transition-colors flex items-center justify-center group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-delight-500" />
                </a>
              </div>
            </div>
          </div>
          
          {/* الروابط والمعلومات */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-10">
              {/* روابط سريعة */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-r-2 border-delight-500 pr-3">
                  روابط سريعة
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      الرئيسية
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      منتجاتنا
                    </Link>
                  </li>
                  <li>
                    <Link to="/factory" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      المصنع
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      حول الشركة
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      تواصل معنا
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* منتجاتنا */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-r-2 border-delight-500 pr-3">
                  منتجاتنا
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/products/exterior" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      منتجات العناية الخارجية
                    </Link>
                  </li>
                  <li>
                    <Link to="/products/interior" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      منتجات العناية الداخلية
                    </Link>
                  </li>
                  <li>
                    <Link to="/products/engine" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      منتجات العناية بالمحرك
                    </Link>
                  </li>
                  <li>
                    <Link to="/products/waxes" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      الشمع والملمعات
                    </Link>
                  </li>
                  <li>
                    <Link to="/products/accessories" className="text-gray-600 hover:text-delight-600 transition-colors flex items-center">
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:rotate-180 text-gray-400" />
                      اكسسوارات العناية
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* معلومات التواصل */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-r-2 border-delight-500 pr-3">
                  معلومات التواصل
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <MapPin className="w-5 h-5 text-delight-500 mt-0.5 ml-3 rtl:ml-0 rtl:mr-3" />
                    <span className="text-gray-600">المنطقة الصناعية، شارع المصانع، المدينة الصناعية</span>
                  </li>
                  <li className="flex items-center">
                    <Phone className="w-5 h-5 text-delight-500 ml-3 rtl:ml-0 rtl:mr-3" />
                    <span dir="ltr" className="text-gray-600">+966 123 456 7890</span>
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-5 h-5 text-delight-500 ml-3 rtl:ml-0 rtl:mr-3" />
                    <span className="text-gray-600">info@delight-auto.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* زر العودة للأعلى */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 group"
            aria-label="العودة للأعلى"
          >
            <ChevronUp className="w-5 h-5 text-delight-500 group-hover:-translate-y-0.5 transition-all duration-300" />
          </button>
        </div>
        
        {/* الفاصل */}
        <div className="border-t border-gray-200 my-8"></div>
        
        {/* حقوق النشر */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-right">
              &copy; {currentYear} ديلايت أوتو. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-delight-600 text-sm transition-colors">سياسة الخصوصية</Link>
              <Link to="/terms" className="text-gray-500 hover:text-delight-600 text-sm transition-colors">شروط الاستخدام</Link>
              <Link to="/faq" className="text-gray-500 hover:text-delight-600 text-sm transition-colors">الأسئلة الشائعة</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
