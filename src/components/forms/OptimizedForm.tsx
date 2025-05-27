import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../../utils/reactPerformance';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    errorMessage?: string;
  };
}

interface OptimizedFormProps {
  /** عنوان النموذج */
  title?: string;
  /** حقول النموذج */
  fields: FormField[];
  /** نص زر الإرسال */
  submitText?: string;
  /** دالة تنفذ عند إرسال النموذج */
  onSubmit: (data: Record<string, any>) => void;
  /** حالة التحميل */
  isLoading?: boolean;
  /** تأخير التحقق من الصحة بالمللي ثانية */
  validationDelay?: number;
  /** عرض رسائل الخطأ مباشرة */
  showErrorsImmediately?: boolean;
}

/**
 * مكون نموذج محسن يقلل من عدد عمليات إعادة التصيير
 * ويحسن أداء التحقق من صحة البيانات
 */
const OptimizedForm: React.FC<OptimizedFormProps> = ({
  title,
  fields,
  submitText = 'إرسال',
  onSubmit,
  isLoading = false,
  validationDelay = 300,
  showErrorsImmediately = false,
}) => {
  // حالة النموذج
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // تهيئة البيانات الأولية
    return fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {} as Record<string, any>);
  });

  // حالة الأخطاء
  const [errors, setErrors] = useState<Record<string, string>>({});
  // حالة اللمس (لإظهار الأخطاء فقط بعد تفاعل المستخدم)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // استخدام debounce للتحقق من صحة البيانات
  const debouncedFormData = useDebounce(formData, validationDelay);

  // التحقق من صحة البيانات
  const validateField = useCallback((name: string, value: any, field: FormField): string => {
    if (field.required && (value === '' || value === null || value === undefined)) {
      return 'هذا الحقل مطلوب';
    }

    if (field.validation) {
      const { pattern, minLength, maxLength, min, max, errorMessage } = field.validation;

      if (pattern && typeof value === 'string' && !pattern.test(value)) {
        return errorMessage || 'القيمة غير صالحة';
      }

      if (minLength && typeof value === 'string' && value.length < minLength) {
        return `يجب أن يكون الحقل على الأقل ${minLength} حرفًا`;
      }

      if (maxLength && typeof value === 'string' && value.length > maxLength) {
        return `يجب أن يكون الحقل أقل من ${maxLength} حرفًا`;
      }

      if (min !== undefined && typeof value === 'number' && value < min) {
        return `يجب أن تكون القيمة أكبر من أو تساوي ${min}`;
      }

      if (max !== undefined && typeof value === 'number' && value > max) {
        return `يجب أن تكون القيمة أقل من أو تساوي ${max}`;
      }
    }

    return '';
  }, []);

  // التحقق من صحة جميع الحقول
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name], field);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData, validateField]);

  // التحقق من صحة البيانات عند تغييرها (مع تأخير)
  useMemo(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors: Record<string, string> = {};

      fields.forEach(field => {
        if (touched[field.name] || showErrorsImmediately) {
          const error = validateField(field.name, debouncedFormData[field.name], field);
          if (error) {
            newErrors[field.name] = error;
          }
        }
      });

      setErrors(newErrors);
    }
  }, [debouncedFormData, fields, touched, validateField, showErrorsImmediately]);

  // معالجة تغيير قيمة الحقل
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  // معالجة إرسال النموذج
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // تحديد جميع الحقول كملموسة
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    // التحقق من صحة النموذج قبل الإرسال
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [fields, formData, onSubmit, validateForm]);

  // عرض حقل النموذج
  const renderField = (field: FormField) => {
    const { name, label, type, placeholder, options, required } = field;
    const error = errors[name];
    const isTouched = touched[name] || showErrorsImmediately;

    switch (type) {
      case 'textarea':
        return (
          <div className="mb-4" key={name}>
            <label className="block text-gray-700 font-medium mb-2" htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              placeholder={placeholder}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isTouched && error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {isTouched && error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="mb-4" key={name}>
            <label className="block text-gray-700 font-medium mb-2" htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isTouched && error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- اختر --</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isTouched && error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-4" key={name}>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={name}
                name={name}
                checked={!!formData[name]}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="mr-2 block text-gray-700" htmlFor={name}>
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            </div>
            {isTouched && error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="mb-4" key={name}>
            <label className="block text-gray-700 font-medium mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {options?.map((option) => (
                <div className="flex items-center" key={option.value}>
                  <input
                    type="radio"
                    id={`${name}-${option.value}`}
                    name={name}
                    value={option.value}
                    checked={formData[name] === option.value}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="mr-2 block text-gray-700" htmlFor={`${name}-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {isTouched && error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
        );

      default:
        return (
          <div className="mb-4" key={name}>
            <label className="block text-gray-700 font-medium mb-2" htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              placeholder={placeholder}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isTouched && error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {isTouched && error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {title && <h2 className="text-xl font-bold mb-6">{title}</h2>}
      
      <form onSubmit={handleSubmit}>
        {fields.map(renderField)}
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? 'جاري الإرسال...' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OptimizedForm;
