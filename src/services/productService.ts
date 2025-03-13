
// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  features?: string[];
  relatedProducts?: string[];
}

// Centralized product data repository
const products: Record<string, Product> = {
  'interior-cleaner': {
    id: 'interior-cleaner',
    name: 'منظف المقصورة الداخلية',
    description: 'منظف عالي الجودة للمقصورة الداخلية للسيارة، يزيل البقع والأوساخ بفعالية ويترك رائحة منعشة.',
    fullDescription: 'منظف المقصورة الداخلية من ديلايت هو منتج متميز مصمم خصيصًا للعناية بالأجزاء الداخلية للسيارة. يعمل على إزالة الأوساخ والغبار والبقع بفعالية من جميع الأسطح الداخلية مثل لوحة القيادة والمقاعد والأبواب. كما أنه يترك طبقة واقية تحمي من الأشعة فوق البنفسجية وتمنع تشقق وتلف الأسطح الداخلية. بالإضافة إلى ذلك، يضفي هذا المنظف لمعانًا طبيعيًا ورائحة منعشة تدوم طويلًا.',
    price: '75 ريال',
    rating: 4.8,
    reviews: 124,
    image: '/placeholder.svg',
    features: [
      'يزيل الأوساخ والبقع بفعالية',
      'آمن لجميع أنواع الأسطح الداخلية',
      'يحمي من الأشعة فوق البنفسجية',
      'رائحة منعشة تدوم طويلاً',
      'سهل الاستخدام'
    ],
    relatedProducts: ['exterior-cleaner', 'tire-shine', 'dashboard-protectant']
  },
  'exterior-cleaner': {
    id: 'exterior-cleaner',
    name: 'منظف الهيكل الخارجي',
    description: 'منظف متطور للهيكل الخارجي للسيارة، يزيل الأوساخ والشحوم ويمنح لمعاناً فائقاً.',
    fullDescription: 'منظف الهيكل الخارجي من ديلايت هو منتج احترافي لتنظيف وحماية السطح الخارجي للسيارة. يعمل على إزالة الأوساخ والشحوم والحشرات وبقع الطيور بكفاءة عالية دون الإضرار بطبقة الطلاء. كما أنه يضفي طبقة لامعة تحمي السيارة من العوامل البيئية وتمنحها مظهراً جذاباً كسيارات المعارض.',
    price: '85 ريال',
    rating: 4.7,
    reviews: 98,
    image: '/placeholder.svg',
    features: [
      'تنظيف عميق دون خدش الطلاء',
      'حماية من العوامل البيئية',
      'لمعان فائق يدوم طويلاً',
      'آمن للاستخدام على جميع أنواع الطلاء',
      'اقتصادي في الاستخدام'
    ],
    relatedProducts: ['interior-cleaner', 'tire-shine', 'wax-polish']
  },
  'tire-shine': {
    id: 'tire-shine',
    name: 'ملمع الإطارات',
    description: 'ملمع إطارات عالي الجودة يمنح الإطارات مظهراً جديداً ولامعاً ويحميها من التشقق والتلف.',
    fullDescription: 'ملمع الإطارات من ديلايت هو منتج متخصص يعيد للإطارات رونقها ومظهرها الجديد. يعمل على تغذية المطاط وحمايته من التشقق والتلف بسبب أشعة الشمس والعوامل البيئية. كما أنه يمنح الإطارات لمعاناً أسود عميقاً يدوم لفترة طويلة، مما يعزز المظهر العام للسيارة.',
    price: '55 ريال',
    rating: 4.9,
    reviews: 132,
    image: '/placeholder.svg',
    features: [
      'لمعان أسود عميق',
      'حماية من الأشعة فوق البنفسجية',
      'مقاوم للماء والأوساخ',
      'سهل التطبيق',
      'يدوم لعدة أسابيع'
    ],
    relatedProducts: ['interior-cleaner', 'exterior-cleaner', 'wheel-cleaner']
  },
  'dashboard-protectant': {
    id: 'dashboard-protectant',
    name: 'حامي لوحة القيادة',
    description: 'منتج متخصص لحماية لوحة القيادة من الأشعة فوق البنفسجية وإضفاء لمعان طبيعي.',
    fullDescription: 'حامي لوحة القيادة من ديلايت هو منتج متخصص يوفر حماية ممتازة للأسطح البلاستيكية والجلدية في لوحة القيادة والأجزاء الداخلية الأخرى. يحمي من الأشعة فوق البنفسجية التي تسبب التلف والتشقق والبهتان، ويعيد اللمعان الطبيعي للأسطح الداخلية. كما أنه يترك طبقة غير دهنية تمنع تراكم الغبار وتسهل التنظيف المستقبلي.',
    price: '65 ريال',
    rating: 4.6,
    reviews: 87,
    image: '/placeholder.svg',
    features: [
      'حماية قصوى من الأشعة فوق البنفسجية',
      'لمعان طبيعي غير لامع',
      'طبقة غير دهنية',
      'مضاد للغبار',
      'آمن لجميع أنواع الأسطح'
    ],
    relatedProducts: ['interior-cleaner', 'leather-conditioner', 'plastic-restorer']
  },
  'wheel-cleaner': {
    id: 'wheel-cleaner',
    name: 'منظف الجنوط',
    description: 'منظف قوي للجنوط يزيل الأوساخ العنيدة وغبار الفرامل دون التسبب في أي ضرر.',
    fullDescription: 'منظف الجنوط من ديلايت هو منتج قوي ومتخصص لتنظيف جنوط السيارات من الأوساخ العنيدة وغبار الفرامل والشحوم. يتميز بتركيبته الآمنة التي لا تضر بالجنوط أو الإطارات. يعمل بسرعة وفعالية لإزالة الأوساخ وإعادة اللمعان الأصلي للجنوط دون الحاجة للفرك الشديد.',
    price: '60 ريال',
    rating: 4.7,
    reviews: 105,
    image: '/placeholder.svg',
    features: [
      'إزالة سريعة لغبار الفرامل',
      'آمن لجميع أنواع الجنوط',
      'تركيبة غير حمضية',
      'لا يضر بالإطارات أو الفرامل',
      'اقتصادي في الاستخدام'
    ],
    relatedProducts: ['tire-shine', 'exterior-cleaner', 'brake-dust-protector']
  },
  'wax-polish': {
    id: 'wax-polish',
    name: 'شمع التلميع',
    description: 'شمع تلميع عالي الجودة يمنح سيارتك لمعاناً كالمرآة ويوفر حماية تدوم لأشهر.',
    fullDescription: 'شمع التلميع من ديلايت هو منتج متميز يجمع بين الشمع الطبيعي والبوليمرات المتطورة لمنح سيارتك لمعاناً استثنائياً وحماية طويلة الأمد. يعمل على ملء الخدوش الدقيقة ويخلق طبقة عازلة ضد الأشعة فوق البنفسجية والأمطار الحمضية والملوثات البيئية. سهل التطبيق ويمنح نتائج احترافية تدوم لأشهر.',
    price: '95 ريال',
    rating: 4.9,
    reviews: 156,
    image: '/placeholder.svg',
    features: [
      'لمعان فائق كالمرآة',
      'حماية تدوم لأشهر',
      'مقاوم للماء والأشعة فوق البنفسجية',
      'يخفي الخدوش الدقيقة',
      'سهل التطبيق والإزالة'
    ],
    relatedProducts: ['exterior-cleaner', 'paint-protector', 'ceramic-boost']
  },
  'leather-conditioner': {
    id: 'leather-conditioner',
    name: 'مغذي الجلد',
    description: 'مغذي متخصص للأسطح الجلدية في السيارة، يرطب ويحمي ويعيد الحيوية والنعومة للجلد.',
    fullDescription: 'مغذي الجلد من ديلايت هو منتج متخصص لتغذية وترطيب وحماية الأسطح الجلدية في السيارة. يعيد للجلد نعومته ومرونته الطبيعية ويمنع جفافه وتشققه. يحتوي على مواد مغذية طبيعية تتغلغل في الجلد لترطيبه من الداخل. كما أنه يوفر حماية من الأشعة فوق البنفسجية ويترك رائحة جلد طبيعية منعشة.',
    price: '85 ريال',
    rating: 4.8,
    reviews: 112,
    image: '/placeholder.svg',
    features: [
      'ترطيب عميق للجلد',
      'حماية من التشقق والجفاف',
      'يعيد اللون والحيوية للجلد',
      'غير دهني ولا يترك آثار',
      'رائحة جلد طبيعية منعشة'
    ],
    relatedProducts: ['dashboard-protectant', 'interior-cleaner', 'fabric-protector']
  },
  'car-shampoo': {
    id: 'car-shampoo',
    name: 'شامبو السيارات الفاخر',
    description: 'شامبو مركز عالي الجودة للعناية بسيارتك والحفاظ على لمعانها الطبيعي مع حماية طويلة الأمد.',
    fullDescription: 'شامبو السيارات الفاخر من ديلايت هو منتج متميز لتنظيف السيارات بلطف وفعالية. يزيل الأوساخ والغبار والحشرات وبقع الطيور دون الإضرار بطبقة الحماية أو الشمع الموجود على السيارة. يتميز بالرغوة الغنية التي تساعد على إزالة الأوساخ بسهولة ويترك طبقة حماية لامعة على السطح. مركّز للغاية، القليل منه يكفي لتنظيف سيارة كاملة.',
    price: '70 ريال',
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    features: [
      'تنظيف عميق ولطيف',
      'رغوة غنية ومستدامة',
      'لا يزيل طبقة الشمع أو السيراميك',
      'يترك لمعانًا فائقًا',
      'مركّز للغاية واقتصادي'
    ],
    relatedProducts: ['exterior-cleaner', 'wax-polish', 'tire-shine']
  },
  'ceramic-coating': {
    id: 'ceramic-coating',
    name: 'طلاء سيراميك للحماية',
    description: 'طلاء سيراميك متطور يوفر حماية فائقة لطلاء السيارة مع تعزيز اللمعان والمقاومة للماء والأوساخ.',
    fullDescription: 'طلاء السيراميك من ديلايت هو منتج متطور يوفر حماية قصوى لطلاء السيارة. يعتمد على تقنية النانو لخلق طبقة حماية قوية وشفافة تلتصق بطلاء السيارة على المستوى الجزيئي. يوفر حماية تدوم لأكثر من عام ضد الخدوش والأشعة فوق البنفسجية والتلوث والماء والأوساخ. يعزز اللمعان ويضفي تأثير التنقيط المذهل الذي يجعل الماء والأوساخ تنزلق عن السطح بسهولة.',
    price: '350 ريال',
    rating: 4.9,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    features: [
      'حماية تدوم لأكثر من عام',
      'مقاومة للخدوش والأشعة فوق البنفسجية',
      'تأثير التنقيط المذهل',
      'تعزيز اللمعان',
      'مقاومة للماء والأوساخ والتلوث'
    ],
    relatedProducts: ['exterior-cleaner', 'wax-polish', 'ceramic-boost']
  }
};

// Functions to interact with product data
export const ProductService = {
  getAllProducts: (): Product[] => {
    return Object.values(products);
  },
  
  getProductById: (id: string): Product | null => {
    return products[id] || null;
  },
  
  getFeaturedProducts: (): Product[] => {
    // Return specific featured products or a subset of all products
    return [
      products['car-shampoo'],
      products['interior-cleaner'],
      products['tire-shine'],
      products['ceramic-coating']
    ];
  },
  
  getRelatedProducts: (productId: string): Product[] => {
    const product = products[productId];
    if (!product || !product.relatedProducts) return [];
    
    return product.relatedProducts
      .map(id => products[id])
      .filter((p): p is Product => p !== undefined);
  }
};
