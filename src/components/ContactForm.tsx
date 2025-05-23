
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    console.log('Form data submitted:', data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success toast
    toast({
      title: "تم إرسال رسالتك",
      description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
      duration: 5000,
    });
    
    // Reset form
    reset();
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
              الاسم الكامل
            </label>
            <Input
              id="name"
              placeholder="أدخل اسمك الكامل"
              {...register('name', { required: 'الاسم مطلوب' })}
              className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              placeholder="example@example.com"
              {...register('email', { 
                required: 'البريد الإلكتروني مطلوب',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'البريد الإلكتروني غير صحيح'
                }
              })}
              className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">
            الموضوع
          </label>
          <Input
            id="subject"
            placeholder="موضوع رسالتك"
            {...register('subject', { required: 'الموضوع مطلوب' })}
            className={errors.subject ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
            الرسالة
          </label>
          <Textarea
            id="message"
            rows={5}
            placeholder="اكتب رسالتك هنا..."
            {...register('message', { required: 'الرسالة مطلوبة' })}
            className={errors.message ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="amazon-btn-primary min-w-[200px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default ContactForm;
