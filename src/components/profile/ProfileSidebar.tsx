
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, ShoppingBag, Settings, Camera, Bell } from 'lucide-react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from '@radix-ui/react-tabs';

interface ProfileSidebarProps {
  user: {
    id: string;
    name?: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  avatarUrl: string | null;
  uploadingAvatar: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => Promise<void>;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  avatarUrl,
  uploadingAvatar,
  handleAvatarUpload,
  handleLogout
}) => {
  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "orders", label: "طلباتي", icon: ShoppingBag },
    { id: "notifications", label: "إعدادات الإشعارات", icon: Bell },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        {/* User Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarImage src={avatarUrl || ''} alt={user?.name || 'صورة المستخدم'} />
              <AvatarFallback className="bg-red-100 text-red-600 text-lg">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute bottom-0 right-0">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors">
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'مستخدم'}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>

        {/* Navigation Tabs */}
        <TabsList className="grid w-full grid-cols-1 gap-2 mb-6 bg-transparent h-auto p-0">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full justify-start p-3 text-right data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-900/20 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  activeTab === tab.id 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                    : 'bg-transparent text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center w-full">
                  <IconComponent className="w-4 h-4 ml-3" />
                  <span>{tab.label}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Add link to notification settings page */}
        <div className="mb-4">
          <Link 
            to="/settings/notifications"
            className="flex items-center w-full p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Bell className="w-4 h-4 ml-3" />
            <span>إدارة الإشعارات</span>
          </Link>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
