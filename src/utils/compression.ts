/**
 * أدوات لضغط الموارد الثابتة وتحسين سرعة التحميل
 */

/**
 * ضغط النص باستخدام خوارزمية LZ77
 * @param text النص المراد ضغطه
 */
export const compressText = async (text: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.TextEncoder || !window.CompressionStream) {
    return text;
  }

  try {
    // تحويل النص إلى مصفوفة بايت
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    // إنشاء تيار ضغط
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();

    // قراءة النتيجة
    const reader = cs.readable.getReader();
    
    // استخدام وظيفة مساعدة لقراءة البيانات
    const readAllChunks = async (reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> => {
      let result = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          result += String.fromCharCode.apply(null, Array.from(value));
        }
      }
      
      return result;
    };
    
    // قراءة جميع البيانات
    const result = await readAllChunks(reader);

    return btoa(result);
  } catch (error) {
    console.error('فشل ضغط النص:', error);
    return text;
  }
};

/**
 * فك ضغط النص المضغوط باستخدام خوارزمية LZ77
 * @param compressedText النص المضغوط
 */
export const decompressText = async (compressedText: string): Promise<string> => {
  if (typeof window === 'undefined' || !window.TextDecoder || !window.DecompressionStream) {
    return compressedText;
  }

  try {
    // تحويل النص المضغوط إلى مصفوفة بايت
    const bytes = new Uint8Array(atob(compressedText).split('').map(char => char.charCodeAt(0)));

    // إنشاء تيار فك الضغط
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();

    // قراءة النتيجة
    const reader = ds.readable.getReader();
    
    // استخدام وظيفة مساعدة لقراءة البيانات
    const readAllChunks = async (reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> => {
      let result = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const readResult = await reader.read();
        if (readResult.done) break;
        if (readResult.value) {
          result += decoder.decode(readResult.value);
        }
      }
      
      return result;
    };
    
    // قراءة جميع البيانات
    const result = await readAllChunks(reader);

    return result;
  } catch (error) {
    console.error('فشل فك ضغط النص:', error);
    return compressedText;
  }
};

/**
 * التحقق من دعم المتصفح لضغط الموارد
 */
export const supportsCompression = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'CompressionStream' in window &&
    'DecompressionStream' in window
  );
};

/**
 * تحسين حجم الصور عن طريق ضغطها
 * @param imageUrl رابط الصورة
 * @param quality جودة الصورة (0-1)
 */
export const compressImage = async (
  imageUrl: string,
  quality: number = 0.8
): Promise<string> => {
  if (typeof window === 'undefined') {
    return imageUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('فشل إنشاء سياق الرسم'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // تحويل الصورة إلى تنسيق WebP إذا كان مدعومًا
      try {
        const compressedUrl = canvas.toDataURL('image/webp', quality);
        resolve(compressedUrl);
      } catch (error) {
        // إذا لم يكن WebP مدعومًا، استخدم JPEG
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      }
    };
    
    img.onerror = () => {
      reject(new Error('فشل تحميل الصورة'));
    };
    
    img.src = imageUrl;
  });
};
