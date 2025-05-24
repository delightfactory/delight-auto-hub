
import React from 'react';
import {
  Bell,
  Package,
  Star,
  CheckCircle,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smile,
  Tag
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
    const iconMap = {
      'package': Package,
      'star': Star,
      'check-circle': CheckCircle,
      'truck': Truck,
      'check-circle-2': CheckCircle2,
      'x-circle': XCircle,
      'alert-triangle': AlertTriangle,
      'smile': Smile,
      'tag': Tag,
      'bell': Bell
    };
    
    return iconMap[iconName as keyof typeof iconMap] || Bell;
  };

  const IconComponent = getIcon(type.icon);
  
  return (
    <div 
      className={`p-2 rounded-full ${isRead ? 'opacity-60' : ''}`}
      style={{ backgroundColor: `${type.color}20` }}
    >
      <IconComponent 
        className="h-4 w-4" 
        style={{ color: type.color }}
      />
    </div>
  );
};

export default NotificationIcon;
