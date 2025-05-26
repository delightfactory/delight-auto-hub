import React from 'react';
import {
  Bell,
  Clock,
  CreditCard,
  RefreshCw,
  Package,
  MapPin,
  Truck,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface NotificationIconProps {
  type: {
    name: string;
    icon: string;
    color: string;
  };
  isRead?: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, isRead = false }) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      pending: Clock,
      paid: CreditCard,
      processing: RefreshCw,
      ready_for_shipping: Package,
      ready_for_pickup: MapPin,
      shipped: Truck,
      out_for_delivery: Send,
      delivered: CheckCircle,
      cancelled: XCircle,
      failed_delivery: AlertTriangle
    };
    
    return iconMap[iconName as keyof typeof iconMap] || Bell;
  };

  const iconName = type?.icon ?? 'bell';
  const IconComponent = getIcon(iconName);
  
  return (
    <div 
      className={`p-2 rounded-full ${isRead ? 'opacity-60' : ''}`}
      style={{ backgroundColor: `${type?.color ?? '#3B82F6'}20` }}
    >
      <IconComponent 
        className="h-4 w-4" 
        style={{ color: type?.color ?? '#3B82F6' }}
      />
    </div>
  );
};

export default NotificationIcon;
