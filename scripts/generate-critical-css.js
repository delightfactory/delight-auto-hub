/**
 * سكربت لتوليد CSS الحرجة
 * يقوم باستخراج CSS الضروري للعرض الأولي للصفحة وإنشاء ملف critical.css
 * هذا يساعد في تحسين وقت التحميل الأولي للصفحة
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import critical from 'critical';

// الحصول على المسار الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// مسارات الملفات
const indexHtml = path.join(rootDir, 'dist', 'index.html');
const outputCss = path.join(rootDir, 'dist', 'assets', 'critical.css');

// التأكد من وجود مجلد الإخراج
const outputDir = path.dirname(outputCss);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * توليد CSS الحرجة
 */
async function generateCriticalCss() {
  try {
    console.log('🔍 جاري توليد CSS الحرجة...');
    
    // التحقق من وجود ملف HTML
    if (!fs.existsSync(indexHtml)) {
      console.error(`❌ ملف HTML غير موجود: ${indexHtml}`);
      console.log('💡 تأكد من تنفيذ أمر البناء (npm run build) أولاً.');
      return;
    }
    
    // توليد CSS الحرجة
    const result = await critical.generate({
      base: path.join(rootDir, 'dist'),
      src: 'index.html',
      target: {
        css: path.relative(path.join(rootDir, 'dist'), outputCss),
        html: 'index-critical.html',
      },
      width: 1300,
      height: 900,
      inline: true,
      extract: true,
      penthouse: {
        timeout: 120000,
      },
    });
    
    console.log(`✅ تم توليد CSS الحرجة وحفظها في: ${outputCss}`);
    console.log(`✅ تم إنشاء HTML مع CSS الحرجة المضمنة في: dist/index-critical.html`);
    
    // إحصائيات حول حجم الملف
    const stats = fs.statSync(outputCss);
    const fileSizeInKB = stats.size / 1024;
    console.log(`📊 حجم ملف CSS الحرجة: ${fileSizeInKB.toFixed(2)} كيلوبايت`);
    
    // نصائح للاستخدام
    console.log('\n💡 لاستخدام CSS الحرجة:');
    console.log('1. قم بتضمين ملف critical.css في رأس الصفحة');
    console.log('2. قم بتحميل ملفات CSS الأخرى بشكل غير متزامن');
    console.log('3. يمكنك استخدام الكود التالي:');
    console.log(`
    <!-- تضمين CSS الحرجة -->
    <style>
      /* قم بنسخ محتوى ملف critical.css هنا */
    </style>
    
    <!-- تحميل CSS الأخرى بشكل غير متزامن -->
    <link rel="preload" href="/assets/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/styles.css"></noscript>
    `);
    
  } catch (error) {
    console.error('❌ حدث خطأ أثناء توليد CSS الحرجة:', error);
  }
}

// تنفيذ عملية توليد CSS الحرجة
generateCriticalCss();
