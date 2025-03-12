
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
                subtitle="نقدم منتجات عالية الجودة للعناية بالسيارات منذ أكثر من 15 عاماً"
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
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1578659258511-4a4e7dee7344?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="DELIGHT History" 
                  className="rounded-xl shadow-xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-delight-100 rounded-full -z-10"></div>
            </motion.div>
            
            {/* Content */}
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
                رحلة التميز والابتكار
              </h2>
              <div className="space-y-4 text-slate-600">
                <p className="text-lg">
                  بدأت رحلة DELIGHT عام 2008 كشركة صغيرة متخصصة في استيراد منتجات العناية بالسيارات، لكن سرعان ما واجهنا تحديات في إيجاد منتجات تلبي معايير الجودة التي نطمح إليها.
                </p>
                <p className="text-lg">
                  في عام 2010، اتخذنا قراراً جريئاً بتأسيس مختبر بحث وتطوير خاص بنا لابتكار منتجات فريدة تجمع بين التكنولوجيا المتقدمة والمكونات عالية الجودة.
                </p>
                <p className="text-lg">
                  وبحلول عام 2015، افتتحنا مصنعنا الأول في المملكة العربية السعودية مع خطوط إنتاج متطورة ومعدات حديثة، واليوم أصبحت منتجاتنا متوفرة في أكثر من 30 دولة حول العالم.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="قيمنا الأساسية"
            subtitle="المبادئ التي نؤمن بها والتي توجه أعمالنا وقراراتنا كل يوم"
            center
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Value 1 */}
            <motion.div 
              className="glass-card p-8 rounded-xl text-center"
              variants={fadeIn}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">الجودة قبل كل شيء</h3>
              <p className="text-slate-600">
                لا نساوم على جودة منتجاتنا مهما كانت التحديات، فرضا العملاء هو مقياس نجاحنا الأول.
              </p>
            </motion.div>
            
            {/* Value 2 */}
            <motion.div 
              className="glass-card p-8 rounded-xl text-center"
              variants={fadeIn}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">الابتكار المستمر</h3>
              <p className="text-slate-600">
                نستثمر في البحث والتطوير لنقدم حلولاً مبتكرة تتجاوز توقعات عملائنا وتواكب التطورات العالمية.
              </p>
            </motion.div>
            
            {/* Value 3 */}
            <motion.div 
              className="glass-card p-8 rounded-xl text-center"
              variants={fadeIn}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">المسؤولية البيئية</h3>
              <p className="text-slate-600">
                نلتزم بتطوير منتجات صديقة للبيئة وعمليات تصنيع مستدامة تقلل من الأثر البيئي.
              </p>
            </motion.div>
            
            {/* Value 4 */}
            <motion.div 
              className="glass-card p-8 rounded-xl text-center"
              variants={fadeIn}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-delight-100 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-delight-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">الشراكات الناجحة</h3>
              <p className="text-slate-600">
                نؤمن بأهمية بناء علاقات طويلة الأمد مع موزعينا وشركائنا تقوم على الثقة والشفافية المتبادلة.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <SectionHeading 
            title="فريق القيادة"
            subtitle="نخبة من الخبراء والمتخصصين يقودون مسيرة النجاح والتطوير في DELIGHT"
            center
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Team Member 1 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden text-center"
              variants={fadeIn}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                  alt="Team Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">أحمد الرياض</h3>
                <p className="text-delight-600 mb-3">الرئيس التنفيذي</p>
                <p className="text-slate-600 text-sm">
                  خبرة أكثر من 20 عاماً في صناعة منتجات العناية بالسيارات على المستوى العالمي.
                </p>
              </div>
            </motion.div>
            
            {/* Team Member 2 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden text-center"
              variants={fadeIn}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80" 
                  alt="Team Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">سارة القحطاني</h3>
                <p className="text-delight-600 mb-3">مديرة البحث والتطوير</p>
                <p className="text-slate-600 text-sm">
                  دكتوراه في الكيمياء التطبيقية مع أكثر من 30 براءة اختراع في مجال تقنيات العناية بالسيارات.
                </p>
              </div>
            </motion.div>
            
            {/* Team Member 3 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden text-center"
              variants={fadeIn}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                  alt="Team Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">خالد العتيبي</h3>
                <p className="text-delight-600 mb-3">مدير العمليات</p>
                <p className="text-slate-600 text-sm">
                  خبرة واسعة في إدارة المصانع وتطوير سلاسل الإمداد في قطاع المنتجات الكيميائية.
                </p>
              </div>
            </motion.div>
            
            {/* Team Member 4 */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden text-center"
              variants={fadeIn}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                  alt="Team Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">لينا المالكي</h3>
                <p className="text-delight-600 mb-3">مديرة التسويق العالمي</p>
                <p className="text-slate-600 text-sm">
                  متخصصة في تطوير استراتيجيات التسويق الرقمي وبناء العلامات التجارية في الأسواق العالمية.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <SectionHeading 
            title="مسيرة النجاح"
            subtitle="رحلة DELIGHT منذ التأسيس وحتى اليوم"
            center
          />
          
          <div className="relative max-w-3xl mx-auto mt-16">
            {/* Timeline Line */}
            <div className="absolute h-full w-0.5 bg-delight-200 left-6 md:left-1/2 transform md:-translate-x-1/2 top-0"></div>
            
            {/* Timeline Items */}
            <div className="space-y-16">
              {/* 2008 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <Clock className="w-6 h-6" />
                </div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-20 md:pl-0">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-delight-600 mb-2">2008</h3>
                    <h4 className="text-lg font-medium mb-3">تأسيس الشركة</h4>
                    <p className="text-slate-600">
                      بداية رحلة DELIGHT كشركة متخصصة في استيراد وتوزيع منتجات العناية بالسيارات.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 2010 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <GraduationCap className="w-6 h-6" />
                </div>
                
                <div className="md:w-1/2 md:ml-auto md:pl-16 pl-20">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-delight-600 mb-2">2010</h3>
                    <h4 className="text-lg font-medium mb-3">إنشاء مختبر البحث والتطوير</h4>
                    <p className="text-slate-600">
                      تأسيس أول مختبر متخصص لتطوير منتجات العناية بالسيارات وفق أعلى المعايير العالمية.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 2015 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <Award className="w-6 h-6" />
                </div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-20 md:pl-0">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-delight-600 mb-2">2015</h3>
                    <h4 className="text-lg font-medium mb-3">افتتاح المصنع الأول</h4>
                    <p className="text-slate-600">
                      افتتاح أول مصنع بمساحة 10,000 متر مربع في المدينة الصناعية بالرياض.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 2018 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <Truck className="w-6 h-6" />
                </div>
                
                <div className="md:w-1/2 md:ml-auto md:pl-16 pl-20">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-delight-600 mb-2">2018</h3>
                    <h4 className="text-lg font-medium mb-3">التوسع العالمي</h4>
                    <p className="text-slate-600">
                      بدء تصدير منتجات DELIGHT إلى الأسواق العالمية ودخول أكثر من 15 سوقاً جديداً.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* 2022 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-full bg-delight-600 text-white flex items-center justify-center font-bold absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <Award className="w-6 h-6" />
                </div>
                
                <div className="md:w-1/2 md:text-right md:pr-16 pl-20 md:pl-0">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-delight-600 mb-2">2022</h3>
                    <h4 className="text-lg font-medium mb-3">توسعة المصنع وخطوط الإنتاج</h4>
                    <p className="text-slate-600">
                      مضاعفة الطاقة الإنتاجية وإضافة خطوط إنتاج جديدة لتلبية الطلب المتزايد على منتجات DELIGHT.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
