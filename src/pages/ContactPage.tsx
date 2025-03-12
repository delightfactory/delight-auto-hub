
import React from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SectionHeading from '@/components/SectionHeading';
import { toast } from '@/components/ui/use-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be the logic to handle form submission
    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنقوم بالرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا!",
    });
  };

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
              title="تواصل معنا"
              subtitle="نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما تحتاجه"
              center
              className="text-white max-w-xl mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Form */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="glass-card p-8 rounded-xl"
            >
              <h3 className="text-2xl font-semibold mb-6">أرسل لنا رسالة</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم
                    </label>
                    <Input id="name" placeholder="أدخل اسمك" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <Input id="email" type="email" placeholder="example@domain.com" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    الموضوع
                  </label>
                  <Input id="subject" placeholder="موضوع الرسالة" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    الرسالة
                  </label>
                  <Textarea id="message" placeholder="اكتب رسالتك هنا..." rows={5} required />
                </div>
                <Button type="submit" className="btn-primary w-full">
                  <Send className="ml-2 h-4 w-4" />
                  <span>إرسال الرسالة</span>
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-2xl font-semibold mb-6">معلومات الاتصال</h3>
              
              <div className="glass-card p-6 rounded-xl flex items-start space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-delight-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-delight-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-1">اتصل بنا</h4>
                  <p className="text-slate-600">+966 12 345 6789</p>
                  <p className="text-slate-600">+966 12 987 6543</p>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex items-start space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-delight-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-delight-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-1">البريد الإلكتروني</h4>
                  <p className="text-slate-600">info@delight-products.com</p>
                  <p className="text-slate-600">sales@delight-products.com</p>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-xl flex items-start space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-delight-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-delight-600" />
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-1">العنوان</h4>
                  <p className="text-slate-600">المدينة الصناعية الثانية</p>
                  <p className="text-slate-600">الرياض، المملكة العربية السعودية</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-10">
        <div className="container-custom">
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md">
            {/* Placeholder for an actual map */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">خريطة الموقع (Google Maps iframe would go here)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
