
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
import { cn } from "@/lib/utils";

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
    <Card className="h-fit sticky top-6">
      <CardContent className="p-4 sm:p-6">
        {/* User Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4 group">
            <Avatar className="h-20 w-20 mx-auto transition-transform duration-300 group-hover:scale-105">
              <AvatarImage 
                src={avatarUrl || ''} 
                alt={user?.name || 'صورة المستخدم'}
                className="object-cover"
              />
              <AvatarFallback className="bg-red-100 text-red-600 text-lg font-medium">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <label 
              htmlFor="avatar-upload" 
              className={cn(
                "absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md",
                "cursor-pointer transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/50",
                "border-2 border-white dark:border-gray-800"
              )}
              title="تغيير الصورة"
            >
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-red-600" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {user?.name || 'مستخدم'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] mx-auto">
            {user?.email}
          </p>
        </div>

        {/* Navigation Tabs */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-1 gap-2 mb-6 bg-transparent h-auto p-0">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full justify-start p-3 text-right transition-all duration-200",
                  "rounded-lg border border-transparent",
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  isActive 
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50 shadow-sm"
                    : "bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center w-full">
                  <IconComponent className={cn(
                    "w-4 h-4 ml-3 transition-transform duration-200",
                    isActive ? "scale-110" : "scale-100"
                  )} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full justify-center gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
