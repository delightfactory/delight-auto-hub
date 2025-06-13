// صفحة "من نحن" - ديلايت (نسخة مُحسّنة وواقعية)

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Clock, 
  Users, 
  Truck, 
  Shield, 
  GraduationCap,
  Target,
  Lightbulb
} from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const AboutPage: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-delight-800 to-blue-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeading 
                title="من نحن"
                subtitle="ديلايت ليست مجرد علامة تجارية... بل قصة تصنيع حقيقي من قلب السوق المصري نحو الريادة"
                center
                className="text-white"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1578659258511-4a4e7dee7344?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                  alt="DELIGHT History" 
                  className="rounded-xl shadow-xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-delight-100 rounded-full -z-10"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-delight-100 text-delight-600 font-medium text-sm">
                قصتنا
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                من قلب مصر... إلى صدارة الابتكار
              </h2>
              <div className="space-y-4 text-slate-600 text-lg">
                <p>
                  تأسست ديلايت عام 2008 من داخل السوق المصري بهدف تقديم مفهوم جديد للعناية الاحترافية بالسيارات يعتمد على الجودة الفعلية والابتكار المحلي.
                </p>
                <p>
                  وفي عام 2010، قررنا الاعتماد على أنفسنا بتأسيس مختبر خاص لتطوير تركيباتنا الكيميائية حسب طبيعة السوق واحتياجات المستخدم العربي.
                </p>
                <p>
                  عام 2013، أنشأنا أول مصنع متخصص لإنتاج منتجات العناية الداخلية والخارجية للسيارات، بخطوط إنتاج تم تصميمها داخليًا لتمنحنا مرونة كاملة وسيطرة دقيقة على كل منتج يخرج باسم ديلايت.
                </p>
                <p>
                  اليوم، نفتخر بأننا من المصانع القليلة في مصر التي تطور وتصنع وتُبدع تحت سقف واحد، ونخدم شبكة واسعة من عملائنا داخل الجمهورية وفي بعض الدول العربية المجاورة.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="قيمنا الأساسية"
            subtitle="ركائز راسخة تقود كل خطوة نخطوها في ديلايت"
            center
          />
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="glass-card p-8 rounded-xl text-center" variants={fadeIn}>
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">الجودة من الجذور</h3>
              <p className="text-slate-600">نصمم المنتج من أول فكرة حتى لحظة التعبئة بتركيز تام على الكفاءة والفعالية.</p>
            </motion.div>
            <motion.div className="glass-card p-8 rounded-xl text-center" variants={fadeIn}>
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">الابتكار المحلى</h3>
              <p className="text-slate-600">نؤمن أن الحلول الحقيقية تنبع من فهم الواقع، لذلك نطوّر تركيباتنا محليًا بما يلائم بيئتنا ومناخنا.</p>
            </motion.div>
            <motion.div className="glass-card p-8 rounded-xl text-center" variants={fadeIn}>
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">وعي بيئي</h3>
              <p className="text-slate-600">نتبنى مبادئ الإنتاج المسؤول بيئيًا، ونحرص على تطوير منتجات آمنة للمستخدم والبيئة.</p>
            </motion.div>
            <motion.div className="glass-card p-8 rounded-xl text-center" variants={fadeIn}>
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">شراكة محلية أصيلة</h3>
              <p className="text-slate-600">نبني علاقتنا مع العملاء والتجار على الاحترام المتبادل والدعم المستمر والنمو المشترك.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <SectionHeading 
            title="علامات مضيئة في رحلتنا"
            subtitle="كيف تطورت ديلايت من فكرة إلى مصنع يخدم السوق المصري والعربي"
            center
          />
          <div className="relative max-w-3xl mx-auto mt-16">
            <div className="absolute h-full w-0.5 bg-delight-200 left-6 md:left-1/2 transform md:-translate-x-1/2 top-0"></div>
            <div className="space-y-16">
              <TimelineItem year="2008" icon={<Clock />} title="البداية من السوق المصري" desc="تأسست ديلايت كموزع محلي يسعى لتقديم منتجات استثنائية في عالم العناية بالسيارات." align="left" />
              <TimelineItem year="2010" icon={<GraduationCap />} title="بداية البحث الداخلي" desc="إطلاق أول مختبر داخلي لتطوير التركيبات الكيميائية بدقة علمية وتطبيق واقعي." align="right" />
              <TimelineItem year="2013" icon={<Award />} title="تصنيع بأيادينا" desc="افتتاح أول مصنع مستقل لمنتجات ديلايت داخل مصر بخطوط إنتاج مصممة حسب احتياجاتنا الخاصة." align="left" />
              <TimelineItem year="2018" icon={<Truck />} title="النمو والتوسع المحلي" desc="زيادة القدرة الإنتاجية وتوسيع دائرة التوزيع داخل مصر وبعض الدول العربية المجاورة." align="right" />
              <TimelineItem year="2022" icon={<Award />} title="إطلاق جيل جديد من المنتجات" desc="تطوير تركيبات بتركيز عالي وأداء أسرع لتلبية احتياجات السوق المتغير والمتسارع." align="left" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TimelineItem = ({ year, icon, title, desc, align }: { year: string, icon: JSX.Element, title: string, desc: string, align: 'left' | 'right' }) => {
  const isLeft = align === 'left';
  return (
    <motion.div className="relative" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
      <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
        {icon}
      </div>
      <div className={`md:w-1/2 ${isLeft ? 'md:text-right md:pr-16 pl-20 md:pl-0' : 'md:ml-auto md:pl-16 pl-20'}`}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-delight-600 mb-2">{year}</h3>
          <h4 className="text-lg font-medium mb-3">{title}</h4>
          <p className="text-slate-600">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
