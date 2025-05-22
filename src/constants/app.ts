
/**
 * ثوابت عامة للتطبيق
 */

// إعدادات العملات
export const CURRENCY = {
  CODE: 'EGP',
  SYMBOL: 'ج.م',
  NAME: 'جنيه مصري',
  FORMAT: (amount: number) => `${amount} ${CURRENCY.SYMBOL}`
};

// إعدادات الشحن
export const SHIPPING = {
  PRICE: 50, // سعر الشحن العادي
  FREE_THRESHOLD: 500, // الحد الأدنى للطلب للحصول على شحن مجاني
  METHODS: [
    { id: 'standard', name: 'شحن عادي', price: 50, days: '3-5 أيام' },
    { id: 'express', name: 'شحن سريع', price: 100, days: '1-2 يوم' },
  ],
};

// طرق الدفع المتاحة
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'الدفع عند الاستلام', icon: 'dollar-sign' },
  { id: 'fawry', name: 'فوري', icon: 'credit-card' },
  { id: 'vodafoneCash', name: 'فودافون كاش', icon: 'smartphone' },
  { id: 'creditCard', name: 'بطاقة ائتمان', icon: 'credit-card' },
];

// الهاتف الخاص بالواتساب للمساعدة
export const WHATSAPP_PHONE = '201211668511';

// مناطق الشحن المتاحة
export const SHIPPING_REGIONS = [
  { id: 'cairo', name: 'القاهرة' },
  { id: 'giza', name: 'الجيزة' },
  { id: 'alexandria', name: 'الإسكندرية' },
  { id: 'delta', name: 'الدلتا' },
  { id: 'upper_egypt', name: 'الصعيد' },
  { id: 'canal', name: 'منطقة القناة' },
];

// إعدادات التطبيق العامة
export const APP_SETTINGS = {
  NAME: 'ديلايت للعناية بالسيارات',
  SUPPORT_EMAIL: 'support@delight-eg.com',
  SUPPORT_PHONE: '01211668511',
  ADDRESS: 'القاهرة، مصر',
};

// أنماط التصفية
export const FILTER_TYPES = {
  CATEGORIES: [
    { id: 'all', name: 'الكل' },
    { id: 'cleaner', name: 'منظفات' },
    { id: 'polish', name: 'ملمعات' },
    { id: 'protection', name: 'حماية' },
    { id: 'tire', name: 'الإطارات' }
  ],
  SORT_OPTIONS: [
    { id: 'price-asc', name: 'السعر: من الأقل للأعلى' },
    { id: 'price-desc', name: 'السعر: من الأعلى للأقل' },
    { id: 'name-asc', name: 'الاسم: أ-ي' },
    { id: 'name-desc', name: 'الاسم: ي-أ' },
    { id: 'newest', name: 'الأحدث' },
  ],
};
