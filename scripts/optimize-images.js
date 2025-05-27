/**
 * سكربت لتحسين الصور وتحويلها إلى تنسيق WebP
 * يقوم بمسح جميع الصور في مجلد public/images وتحويلها إلى تنسيق WebP
 * كما يقوم بإنشاء نسخ مختلفة الأحجام للصور لاستخدامها في srcset
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { glob } from 'glob';

// الحصول على المسار الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// مجلدات الصور
const inputDir = path.join(rootDir, 'public', 'images');
const outputDir = path.join(rootDir, 'public', 'images', 'optimized');

// أحجام الصور المختلفة
const sizes = [320, 480, 640, 768, 1024, 1280, 1536];

// التأكد من وجود مجلد الإخراج
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * تحسين صورة واحدة وتحويلها إلى WebP
 */
async function optimizeImage(inputPath, outputPath, width, quality = 80) {
  try {
    await sharp(inputPath)
      .resize(width)
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(`✅ تم تحسين الصورة: ${outputPath}`);
  } catch (error) {
    console.error(`❌ فشل تحسين الصورة ${inputPath}:`, error);
  }
}

/**
 * تحسين جميع الصور في المجلد
 */
async function optimizeAllImages() {
  try {
    // البحث عن جميع الصور
    const imageFiles = await glob('**/*.{jpg,jpeg,png,gif}', { cwd: inputDir });
    
    if (imageFiles.length === 0) {
      console.log('⚠️ لم يتم العثور على أي صور للتحسين.');
      return;
    }
    
    console.log(`🔍 تم العثور على ${imageFiles.length} صورة للتحسين.`);
    
    // تحسين كل صورة بأحجام مختلفة
    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const fileName = path.parse(file).name;
      const fileDir = path.dirname(file);
      
      // إنشاء مجلد الإخراج إذا لم يكن موجودًا
      const outputFileDir = path.join(outputDir, fileDir);
      if (!fs.existsSync(outputFileDir)) {
        fs.mkdirSync(outputFileDir, { recursive: true });
      }
      
      // إنشاء نسخة WebP بالحجم الأصلي
      const originalOutputPath = path.join(outputFileDir, `${fileName}.webp`);
      await optimizeImage(inputPath, originalOutputPath, null);
      
      // إنشاء نسخ بأحجام مختلفة
      for (const size of sizes) {
        const resizedOutputPath = path.join(outputFileDir, `${fileName}-${size}.webp`);
        await optimizeImage(inputPath, resizedOutputPath, size);
      }
    }
    
    console.log('✨ تم الانتهاء من تحسين جميع الصور!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تحسين الصور:', error);
  }
}

// تنفيذ عملية التحسين
optimizeAllImages();
