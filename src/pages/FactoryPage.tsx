
import React from 'react';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/SectionHeading';
import { motion } from 'framer-motion';
import { 
  BeakerIcon, 
  FlaskConical, 
  Factory, 
  BarChart,
  Shield,
  Leaf
} from 'lucide-react';

const FactoryPage: React.FC = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  return (
    <div>
      <PageHeader 
        title="مصنعنا"
        subtitle="تعرف على مصنعنا المتطور ومرافق الإنتاج والبحث والتطوير"
        backgroundImage="https://images.unsplash.com/photo-1493854624666-fd5d34593c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      />
      
      {/* Overview Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <SectionHeading 
                  title="مرافق تصنيع متطورة"
                  subtitle="مصنع حديث مجهز بأحدث التقنيات والمعدات لضمان أعلى معايير الجودة"
                />
                
                <p className="text-slate-600 mb-6">
                  يتميز مصنعنا بقدرته على إنتاج مجموعة واسعة من منتجات العناية بالسيارات عالية الجودة. يضم المصنع خطوط إنتاج آلية بالكامل ومختبرات متطورة للبحث والتطوير وضمان الجودة.
                </p>
                
                <p className="text-slate-600 mb-6">
                  نلتزم بتطبيق أفضل ممارسات التصنيع والمعايير العالمية للسلامة والاستدامة البيئية في جميع عملياتنا، مما يضمن منتجات فعالة وآمنة وصديقة للبيئة.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="flex">
                    <div className="rounded-full bg-delight-100 p-3 mr-4">
                      <Factory className="w-6 h-6 text-delight-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">مرافق حديثة</h3>
                      <p className="text-slate-600 text-sm">مساحة 10,000 متر مربع مجهزة بأحدث التقنيات</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="rounded-full bg-delight-100 p-3 mr-4">
                      <BeakerIcon className="w-6 h-6 text-delight-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">مختبرات متطورة</h3>
                      <p className="text-slate-600 text-sm">مختبرات لضمان الجودة والبحث والتطوير</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Image */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1517232115160-ff93364542dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80" 
                  alt="DELIGHT Factory" 
                  className="rounded-xl shadow-lg object-cover h-full w-full"
                />
                <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-delight-100 rounded-full -z-10"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Production Process */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="عملية الإنتاج"
            subtitle="نظرة على مراحل تصنيع منتجاتنا عالية الجودة من البداية وحتى التعبئة والتغليف"
            center
          />
          
          <div className="relative mt-16">
            {/* Timeline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-delight-100"></div>
            
            {/* Step 1 */}
            <motion.div 
              className="relative flex items-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-1/2 pr-8 text-right">
                <h3 className="text-xl font-semibold mb-2">البحث والتطوير</h3>
                <p className="text-slate-600">
                  يبدأ كل منتج في مختبراتنا المتطورة، حيث يقوم فريق من الخبراء والعلماء بابتكار وتطوير صيغ فعالة وآمنة.
                </p>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-delight-100 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-delight-600" />
              </div>
              <div className="w-1/2 pl-8"></div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="relative flex items-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-1/2 pr-8"></div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-delight-100 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-delight-600" />
              </div>
              <div className="w-1/2 pl-8">
                <h3 className="text-xl font-semibold mb-2">الاختبار وضمان الجودة</h3>
                <p className="text-slate-600">
                  تخضع جميع المنتجات لاختبارات صارمة لضمان فعاليتها وأمانها وتوافقها مع أعلى المعايير العالمية.
                </p>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="relative flex items-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-1/2 pr-8 text-right">
                <h3 className="text-xl font-semibold mb-2">الإنتاج الضخم</h3>
                <p className="text-slate-600">
                  بعد اعتماد الصيغة، يبدأ الإنتاج على نطاق واسع في خطوط الإنتاج الآلية تحت إشراف فريق من المتخصصين.
                </p>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-delight-100 flex items-center justify-center">
                <Factory className="w-6 h-6 text-delight-600" />
              </div>
              <div className="w-1/2 pl-8"></div>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              className="relative flex items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-1/2 pr-8"></div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-delight-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-delight-600" />
              </div>
              <div className="w-1/2 pl-8">
                <h3 className="text-xl font-semibold mb-2">التعبئة والتغليف والتوزيع</h3>
                <p className="text-slate-600">
                  تتم تعبئة المنتجات في عبوات عالية الجودة وصديقة للبيئة، ثم تخضع لفحص نهائي قبل توزيعها.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Sustainability */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80" 
                  alt="Sustainability" 
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute -top-6 -right-6 w-48 h-48 bg-delight-100 rounded-full -z-10"></div>
              </motion.div>
            </div>
            
            {/* Content */}
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <SectionHeading 
                  title="الاستدامة والمسؤولية البيئية"
                  subtitle="نلتزم بتطوير منتجات فعالة وصديقة للبيئة مع تقليل الأثر البيئي لعملياتنا"
                />
                
                <p className="text-slate-600 mb-8">
                  في DELIGHT، نؤمن بأن العناية بالسيارات يمكن أن تكون فعالة وصديقة للبيئة في نفس الوقت. نحن ملتزمون بتقليل بصمتنا البيئية من خلال:
                </p>
                
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="rounded-full bg-delight-100 p-2 mr-4 h-fit">
                      <Leaf className="w-5 h-5 text-delight-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">مكونات قابلة للتحلل الحيوي</h3>
                      <p className="text-slate-600">
                        استخدام مكونات طبيعية وقابلة للتحلل الحيوي كلما أمكن ذلك.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="rounded-full bg-delight-100 p-2 mr-4 h-fit">
                      <Leaf className="w-5 h-5 text-delight-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">عبوات قابلة لإعادة التدوير</h3>
                      <p className="text-slate-600">
                        استخدام مواد تغليف قابلة لإعادة التدوير وتقليل استخدام البلاستيك.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="rounded-full bg-delight-100 p-2 mr-4 h-fit">
                      <Leaf className="w-5 h-5 text-delight-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">كفاءة الطاقة</h3>
                      <p className="text-slate-600">
                        استخدام مصادر طاقة متجددة وتحسين كفاءة الطاقة في مرافق التصنيع.
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-delight-800 to-blue-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                هل ترغب في زيارة مصنعنا؟
              </h2>
              <p className="text-xl text-delight-100 mb-8">
                نرحب بزيارات الموزعين والشركاء والعملاء المهتمين للتعرف عن قرب على مرافق التصنيع ومعايير الجودة
              </p>
              <a href="/contact" className="bg-white text-delight-800 hover:bg-delight-50 px-8 py-3 rounded-lg font-medium inline-block">
                احجز زيارة الآن
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FactoryPage;
