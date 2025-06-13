// صفحة "مصنع ديلايت" - النسخة المطورة بصريًا

import React from 'react';
import { motion } from 'framer-motion';
import { Factory, FlaskConical, PackageCheck, ShieldCheck, Boxes, Truck, Target, Lightbulb } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const FactoryPage: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-28 bg-cover bg-center text-white shadow-inner" style={{ backgroundImage: "url('/images/factory-hero.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 container-custom text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">مصنع ديلايت</h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              أكثر من مجرد مصنع... إنها منشأة مصرية فريدة تقود ثورة في عالم منتجات العناية بالسيارات منذ أكثر من 13 عامًا.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Extended Overview */}
      <section className="py-24 bg-white">
        <div className="container-custom space-y-20 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SectionHeading
              title="رحلتنا الصناعية... من الطموح إلى الريادة"
              subtitle="ديلايت... قصة مصنع وُلد من الحاجة وازدهر بالثقة والخبرة"
            />
            <div className="text-slate-700 space-y-10 text-lg leading-loose">
              <div>
                <h4 className="text-xl font-semibold mb-2 text-delight-700">البداية والتحدي</h4>
                <p>في عام 2010، انطلقت ديلايت من قلب السوق المصري برؤية جريئة: تأسيس أول مصنع محلي متخصص بالكامل في إنتاج منتجات العناية بالسيارات بجودة تضاهي المستورد، وتُلبي احتياجات بيئتنا المناخية والسلوكية.</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-delight-700">مرحلة التطوير</h4>
                <p>بدأنا بمختبر صغير وبحث دائم، نجرب ونُعيد الصياغة، نختبر ونتعلم. لم ننتظر الدعم، بل صنعنا طريقنا بفضل العلم والخبرة والإصرار.</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-delight-700">التحول الصناعي</h4>
                <p>في 2013، وُلد المصنع الفعلي. بخط إنتاج صُمم داخليًا، بدأنا أول دفعة حقيقية من منتج مصري 100% للعناية الداخلية والخارجية بالسيارات. ومنذ ذلك الحين، ونحن في نمو مستمر، بخطوط تعبئة أوتوماتيكية، ومختبرات متطورة، ونظام رقابة صارم.</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2 text-delight-700">رسالة متجددة</h4>
                <p>نحن لا نصنّع فقط. نحن نعيد تعريف جودة المنتج المصري، نُعلّم السوق أن التميّز ليس حكرًا على الخارج، وأن "صُنع في مصر" يمكن أن يكون فخرًا حقيقيًا.</p>
              </div>
            </div>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <div className="bg-white border border-delight-200 p-8 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-delight-600" />
                <h3 className="text-xl font-bold">مهمتنا</h3>
              </div>
              <p className="text-slate-700 leading-loose">
                أن نُعيد تعريف معايير الجودة في سوق العناية بالسيارات في مصر والشرق الأوسط، من خلال تصنيع محلي متكامل، يعتمد على البحث والابتكار، ويخاطب المستخدم الحقيقي لا الافتراضي.
              </p>
            </div>
            <div className="bg-white border border-yellow-200 p-8 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold">رؤيتنا</h3>
              </div>
              <p className="text-slate-700 leading-loose">
                أن نصبح المصنع المرجعي في العالم العربي لصناعة منتجات العناية بالسيارات، بمستوى احترافي لا يقل عن الشركات العالمية، وبروح مصرية واعية وفخورة.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg"
          >
            <img
              src="/images/factory-inside.jpg"
              alt="صورة من داخل المصنع"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-gradient-to-b from-gray-50 to-white border-t border-slate-200">
        <div className="container-custom">
          <SectionHeading
            title="ما الذي يجعل مصنع ديلايت مختلفًا؟"
            subtitle="ليست مجرد إمكانيات... بل فلسفة تصنيع كاملة"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16 px-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
              >
                <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-delight-100 text-delight-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <Factory className="w-6 h-6" />, 
    title: 'تصنيع داخلي 100%',
    description: 'من الخلط إلى التعبئة، كل مرحلة تتم داخل منشآتنا لنضمن السيطرة الكاملة على الجودة والنتائج.'
  },
  {
    icon: <FlaskConical className="w-6 h-6" />, 
    title: 'مختبر تطوير متقدم',
    description: 'كل تركيبة تمر بمراحل اختبار مكثفة داخل مختبرنا العلمي، لضمان الفاعلية والسلامة في الظروف الفعلية.'
  },
  {
    icon: <PackageCheck className="w-6 h-6" />, 
    title: 'رقابة جودة حقيقية',
    description: 'نعتمد نظامًا صارمًا لمراقبة الجودة عبر نقاط تفتيش متعددة، بدءًا من استلام المواد الخام وحتى تخزين المنتج النهائي.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />, 
    title: 'أمان صناعي وبيئي',
    description: 'نطبق إجراءات صارمة للسلامة المهنية ونراعي الأثر البيئي في كل عملية إنتاج.'
  },
  {
    icon: <Boxes className="w-6 h-6" />, 
    title: 'مرونة تشغيلية',
    description: 'نمتلك القدرة على تخصيص خطوط إنتاج حسب نوع المنتج وحجم الطلب، دون التأثير على وتيرة الجودة.'
  },
  {
    icon: <Truck className="w-6 h-6" />, 
    title: 'جاهزية للتوزيع الفوري',
    description: 'موقع المصنع وخطوط التعبئة الأوتوماتيكية تجعلنا قادرين على تلبية الطلبات بكفاءة وسرعة.'
  },
];

export default FactoryPage;
