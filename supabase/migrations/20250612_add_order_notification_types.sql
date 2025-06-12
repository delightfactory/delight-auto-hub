-- إضافة أنواع إشعارات الطلب إلى جدول notification_types
-- إشعار استلام الطلب
INSERT INTO notification_types (id, name, description, icon, color)
SELECT gen_random_uuid(), 'order_created', 'إشعار عند استلام طلب جديد', 'Package', 'blue'
WHERE NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'order_created');

-- إشعار تحديث حالة الطلب
INSERT INTO notification_types (id, name, description, icon, color)
SELECT gen_random_uuid(), 'order_status_updated', 'إشعار عند تحديث حالة الطلب', 'RefreshCw', 'orange'
WHERE NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'order_status_updated');
