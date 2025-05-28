import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import {
  Notification as UserNotification,
  BroadcastNotification,
} from '@/services/notificationService';

type NotificationUnion = UserNotification | BroadcastNotification;

interface NotificationDetailDialogProps {
  notification: NotificationUnion;
  open: boolean;
  onClose: () => void;
}

// خريطة تحويل الأولوية (رقم أو نص) إلى ملصق ولون
const priorityMap: Record<string, { label: string; color: string }> = {
  '1': { label: 'منخفض', color: 'text-green-600' },
  '2': { label: 'متوسط', color: 'text-yellow-600' },
  '3': { label: 'عالي', color: 'text-red-600' },
  'منخفض': { label: 'منخفض', color: 'text-green-600' },
  'متوسط': { label: 'متوسط', color: 'text-yellow-600' },
  'عالي': { label: 'عالي', color: 'text-red-600' },
};

// دالة للحصول على ملصق ولون الأولوية بأي صيغة
const getPriority = (level: string | number) => {
  const key = typeof level === 'number' ? level.toString() : level;
  return priorityMap[key] ?? { label: key, color: 'text-gray-600' };
};

const NotificationDetailDialog: React.FC<NotificationDetailDialogProps> = ({
  notification,
  open,
  onClose,
}) => {
  if (!notification || !open) return null;
  const pr = getPriority(notification.priority);
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-hidden" 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div 
        className="max-w-lg w-full p-0 rounded-lg overflow-hidden flex flex-col max-h-[90vh] bg-white shadow-2xl dark:bg-gray-800" 
        style={{ zIndex: 10000, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">{notification.title}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-6 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Message */}
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {notification.message}
          </div>
          
          {/* Order ID */}
          {'order_id' in notification.data && (
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              رقم الطلب: {notification.data.order_id}
            </div>
          )}
          
          <Separator />
          
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>التاريخ</div>
            <div className="sm:col-span-2">{format(new Date(notification.created_at), 'PPpp', { locale: ar })}</div>
            
            {'priority' in notification && (
              <>
                <div>الأولوية</div>
                <div className={pr.color}>{pr.label}</div>
              </>
            )}
            
            {'target_role' in notification && (
              <>
                <div>موجه لـ</div>
                <div>{notification.target_role}</div>
              </>
            )}
          </div>
          
          <Separator />
          
          {/* Additional Details */}
          <div className="space-y-4">
            {notification.data.status && (
              <div className="flex items-center">
                <span className="font-medium w-24">حالة الطلب:</span>
                <span>{notification.data.status}</span>
              </div>
            )}
            
            {notification.data.total_price && (
              <div className="flex items-center">
                <span className="font-medium w-24">المجموع:</span>
                <span>{notification.data.total_price}</span>
              </div>
            )}
            
            {notification.data.items && (
              <div>
                <h5 className="text-sm font-medium mb-2">المنتجات:</h5>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notification.data.items.map((item: any, idx: number) => (
                    <li key={idx} className="py-2 flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="modern-ghost" onClick={onClose} className="w-full">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailDialog;
