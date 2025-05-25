import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-3 px-4 lg:px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="mr-2">
          <Menu size={20} />
        </Button>
        
        <div className="relative hidden md:block w-64">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث سريع..."
            className="pr-10 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        {/* استخدام مركز الإشعارات الحقيقي بدلاً من القائمة المنسدلة الثابتة */}
        <NotificationCenter />
        
        <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          العودة إلى الموقع
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
