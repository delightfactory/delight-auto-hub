/**
 * تعريف مكتبة lodash
 * هذا الملف يقوم بتوجيه استيراد lodash إلى lodash-es
 * حيث أن المشروع يستخدم lodash-es بدلاً من lodash العادية
 */
declare module 'lodash' {
  // استيراد كل التصديرات من lodash-es
  export * from 'lodash-es';
}
