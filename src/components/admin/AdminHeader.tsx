
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-3 px-4 lg:px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:hidden">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell size={18} />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium">طلب جديد</span>
                <span className="text-xs text-gray-500">تم استلام طلب جديد بقيمة 240 ريال</span>
                <span className="text-xs text-gray-400 mt-1">منذ 5 دقائق</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium">عميل جديد</span>
                <span className="text-xs text-gray-500">قام أحمد محمد بالتسجيل في الموقع</span>
                <span className="text-xs text-gray-400 mt-1">منذ 30 دقيقة</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Link to="/admin/notifications" className="text-sm text-blue-600">
                عرض جميع الإشعارات
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          العودة إلى الموقع
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
