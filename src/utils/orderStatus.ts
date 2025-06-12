import { Constants } from '@/integrations/supabase/types';

const { order_status_expanded_enum: ORDER_STATUSES } = Constants.public.Enums;
const [
  PENDING,
  PAID,
  PROCESSING,
  READY_FOR_SHIPPING,
  READY_FOR_PICKUP,
  SHIPPED,
  OUT_FOR_DELIVERY,
  DELIVERED,
  CANCELLED,
  FAILED_DELIVERY,
] = ORDER_STATUSES;

export const ORDER_STATUS_TRANSLATIONS: Record<string, string> = {
  [PENDING]: 'قيد الانتظار',
  [PAID]: 'تم الدفع',
  [PROCESSING]: 'قيد المعالجة',
  [READY_FOR_SHIPPING]: 'جاهز للشحن',
  [READY_FOR_PICKUP]: 'جاهز للاستلام',
  [SHIPPED]: 'تم الشحن',
  [OUT_FOR_DELIVERY]: 'في الطريق للتسليم',
  [DELIVERED]: 'مكتمل',
  [CANCELLED]: 'ملغي',
  [FAILED_DELIVERY]: 'فشل التسليم',
};

export function translateOrderStatus(status: string): string {
  return ORDER_STATUS_TRANSLATIONS[status] ?? status;
}
