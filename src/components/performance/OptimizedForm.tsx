import React, { useState, useCallback } from 'react';
import { useThrottle } from '../../utils/reactPerformance';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | null;
}

interface OptimizedFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
}

export const OptimizedForm: React.FC<OptimizedFormProps> = ({
  fields,
  onSubmit,
  submitLabel = 'إرسال',
  className = '',
}) => {
  // إنشاء كائن الحالة الأولية من الحقول
  const initialValues = fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {} as Record<string, string>);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استخدام throttle لتحسين أداء التحقق من الصحة أثناء الكتابة
  const validateField = useThrottle((name: string, value: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return;

    let error: string | null = null;

    // التحقق من الحقول المطلوبة
    if (field.required && !value.trim()) {
      error = `${field.label} مطلوب`;
    }

    // تنفيذ التحقق المخصص إذا كان موجودًا
    if (!error && field.validation) {
      error = field.validation(value);
    }

    // تحديث أخطاء الحقل
    setErrors(prev => ({
      ...prev,
      [name]: error || '',
    }));
  }, 300);

  // معالج تغيير الحقل
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // تحديد الحقل كملموس
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true,
      }));
    }
    
    // التحقق من صحة الحقل
    validateField(name, value);
  }, [touched, validateField]);

  // التحقق من صحة جميع الحقول
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = values[field.name];
      
      // التحقق من الحقول المطلوبة
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} مطلوب`;
        isValid = false;
      }
      
      // تنفيذ التحقق المخصص إذا كان موجودًا
      if (!newErrors[field.name] && field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [fields, values]);

  // معالج تقديم النموذج
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // تحديد جميع الحقول كملموسة
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    // التحقق من صحة النموذج قبل التقديم
    if (validateForm()) {
      setIsSubmitting(true);
      
      // محاكاة طلب غير متزامن
      setTimeout(() => {
        onSubmit(values);
        setIsSubmitting(false);
      }, 500);
    }
  }, [fields, validateForm, values, onSubmit]);

  // تقديم كل حقل بناءً على نوعه
  const renderField = (field: FormField) => {
    const { name, label, type, placeholder, required, options } = field;
    const error = touched[name] && errors[name];
    
    const commonProps = {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      placeholder,
      className: `w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
        error ? 'border-red-500' : 'border-gray-300'
      }`,
      required,
    };
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">اختر...</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
      {fields.map(field => (
        <div key={field.name} className="space-y-1">
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
          {touched[field.name] && errors[field.name] && (
            <p className="text-sm text-red-500">{errors[field.name]}</p>
          )}
        </div>
      ))}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري المعالجة...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
};
