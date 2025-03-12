
import React from 'react';
import { motion } from 'framer-motion';
import { Factory, Truck, Award, CheckCircle, Map } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';

const FactoryPage: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-delight-800 to-blue-900 py-20 text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading
              title="مصنعنا"
              subtitle="مركز الإنتاج والابتكار في ديلايت"
              center
              className="text-white max-w-xl mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Factory Overview */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionHeading
                title="تقنية حديثة بمعايير عالمية"
                subtitle="نستخدم أحدث التقنيات والمعدات لضمان أعلى مستويات الجودة في منتجاتنا"
              />
              <p className="text-slate-600 mb-6">
                يقع مصنعنا الرئيسي في المدينة الصناعية بالرياض على مساحة تزيد عن 10,000 متر مربع، مجهز بأحدث خطوط الإنتاج والمعدات المتطورة. نحرص على تطبيق أفضل معايير الجودة العالمية في كافة مراحل التصنيع بدءًا من اختيار المواد الخام وحتى تعبئة المنتج النهائي.
              </p>
              <p className="text-slate-600 mb-6">
                يتميز مصنعنا بقدرته الإنتاجية العالية التي تلبي احتياجات السوق المحلي وتفتح آفاقًا واسعة للتصدير إلى الأسواق الإقليمية والعالمية. كما يضم المصنع مختبرًا متطورًا لفحص واختبار المنتجات للتأكد من مطابقتها لأعلى معايير الجودة.
              </p>
              <div className="flex gap-4 mt-8">
                <Button size="lg">
                  <Factory className="mr-2" />
                  <span>طلب زيارة المصنع</span>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl overflow-hidden"
            >
              <div className="aspect-video bg-gray-200 rounded-xl">
                {/* هنا يمكن إضافة صورة حقيقية للمصنع */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  صورة المصنع
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Factory Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading
            title="مميزات مصنعنا"
            subtitle="نفخر بامتلاك مصنع متطور بمواصفات عالمية"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-delight-50 rounded-full flex items-center justify-center text-delight-600 mb-4">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">خطوط إنتاج متطورة</h3>
              <p className="text-slate-600">
                نستخدم أحدث التقنيات وخطوط الإنتاج الآلية التي تضمن جودة عالية واتساق في المنتجات.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-delight-50 rounded-full flex items-center justify-center text-delight-600 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">مختبر الجودة</h3>
              <p className="text-slate-600">
                يضم المصنع مختبرًا متكاملًا لاختبار المنتجات وضمان توافقها مع أعلى معايير الجودة العالمية.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-delight-50 rounded-full flex items-center justify-center text-delight-600 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">شهادات الجودة</h3>
              <p className="text-slate-600">
                حاصلون على شهادات ISO العالمية وشهادات الجودة المحلية من الهيئة السعودية للمواصفات والمقاييس.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-delight-50 rounded-full flex items-center justify-center text-delight-600 mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">مركز لوجستي متكامل</h3>
              <p className="text-slate-600">
                نمتلك مركزًا لوجستيًا متطورًا لتخزين وشحن المنتجات بكفاءة عالية داخل المملكة وخارجها.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 bg-delight-50 rounded-full flex items-center justify-center text-delight-600 mb-4">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">موقع استراتيجي</h3>
              <p className="text-slate-600">
                يقع المصنع في موقع استراتيجي يسهل الوصول إليه ويسمح بسرعة توزيع المنتجات لكافة مناطق المملكة.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Production Process */}
      <section className="py-16">
        <div className="container-custom">
          <SectionHeading
            title="عملية الإنتاج"
            subtitle="نتبع منهجية دقيقة في تصنيع منتجاتنا لضمان أعلى مستويات الجودة"
            center
          />
          <div className="relative mt-16">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-200"></div>
            
            <div className="space-y-24">
              {/* خطوة 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex items-center"
              >
                <div className="flex-1 ml-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm ml-auto max-w-md">
                    <h3 className="text-xl font-semibold mb-2">اختيار المواد الخام</h3>
                    <p className="text-slate-600">
                      نحرص على اختيار أفضل المواد الخام من مصادر موثوقة ومعتمدة عالميًا لضمان جودة المنتج النهائي.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-delight-600 text-white flex items-center justify-center">1</div>
              </motion.div>
              
              {/* خطوة 2 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex items-center"
              >
                <div className="flex-1 mr-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
                    <h3 className="text-xl font-semibold mb-2">التصنيع والمعالجة</h3>
                    <p className="text-slate-600">
                      تمر المواد الخام بعمليات تصنيع ومعالجة دقيقة باستخدام أحدث التقنيات لتحويلها إلى منتجات ذات جودة عالية.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-delight-600 text-white flex items-center justify-center">2</div>
              </motion.div>
              
              {/* خطوة 3 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex items-center"
              >
                <div className="flex-1 ml-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm ml-auto max-w-md">
                    <h3 className="text-xl font-semibold mb-2">مراقبة الجودة</h3>
                    <p className="text-slate-600">
                      تخضع جميع المنتجات لفحوصات دقيقة في مختبرنا المتطور للتأكد من مطابقتها للمواصفات وضمان كفاءتها.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-delight-600 text-white flex items-center justify-center">3</div>
              </motion.div>
              
              {/* خطوة 4 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex items-center"
              >
                <div className="flex-1 mr-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
                    <h3 className="text-xl font-semibold mb-2">التعبئة والتغليف</h3>
                    <p className="text-slate-600">
                      يتم تعبئة المنتجات في عبوات عالية الجودة صديقة للبيئة تحافظ على خصائص المنتج وتضمن سهولة الاستخدام.
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-delight-600 text-white flex items-center justify-center">4</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-delight-600 py-16 text-white">
        <div className="container-custom text-center">
          <SectionHeading
            title="تعرف على منتجاتنا"
            subtitle="اكتشف مجموعتنا المتكاملة من منتجات العناية بالسيارات المصنوعة بأعلى معايير الجودة"
            center
            className="text-white max-w-xl mx-auto"
          />
          <Button 
            variant="outline" 
            size="lg" 
            className="mt-8 bg-white text-delight-600 hover:bg-white/90 hover:text-delight-700"
          >
            استعرض المنتجات
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FactoryPage;
