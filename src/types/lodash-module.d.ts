/**
 * تعريف إضافي لمكتبة lodash
 * هذا الملف يساعد في حل مشكلة "Cannot find type definition file for 'lodash'"
 */
declare module 'lodash' {
  import * as LodashES from 'lodash-es';
  export = LodashES;
}
