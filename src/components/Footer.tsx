
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
  ArrowRight
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-display font-bold">
              <span className="bg-gradient-to-r from-delight-400 to-blue-300 bg-clip-text text-transparent">
                DELIGHT
              </span>
            </div>
            <p className="text-slate-300 max-w-xs">
              شركة متخصصة في صناعة وتوزيع منتجات العناية بالسيارات ذات الجودة العالية لضمان الحماية والعناية المثالية بمركبتك.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-delight-600 transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-delight-600 transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-delight-600 transition-colors flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-delight-600 transition-colors flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-delight-300">روابط سريعة</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link to="/" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  منتجاتنا
                </Link>
              </li>
              <li>
                <Link to="/factory" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  المصنع
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  حول الشركة
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-delight-300">منتجاتنا</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link to="/products/exterior" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  منتجات العناية الخارجية
                </Link>
              </li>
              <li>
                <Link to="/products/interior" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  منتجات العناية الداخلية
                </Link>
              </li>
              <li>
                <Link to="/products/engine" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  منتجات العناية بالمحرك
                </Link>
              </li>
              <li>
                <Link to="/products/waxes" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  الشمع والملمعات
                </Link>
              </li>
              <li>
                <Link to="/products/accessories" className="hover:text-delight-400 transition-colors inline-flex items-center">
                  <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
                  اكسسوارات العناية
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-delight-300">معلومات التواصل</h3>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-delight-400 mt-1 ml-3 rtl:ml-0 rtl:mr-0" />
                <span>المنطقة الصناعية، شارع المصانع، المدينة الصناعية</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-delight-400 ml-3 rtl:ml-0 rtl:mr-0" />
                <span dir="ltr">+966 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-delight-400 ml-3 rtl:ml-0 rtl:mr-0" />
                <span>info@delight-auto.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} DELIGHT. جميع الحقوق محفوظة
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-delight-400 transition-colors">سياسة الخصوصية</Link>
              <Link to="/terms" className="hover:text-delight-400 transition-colors">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
