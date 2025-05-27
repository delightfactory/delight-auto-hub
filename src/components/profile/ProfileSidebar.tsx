
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, ShoppingBag, Settings, Camera, Bell, BadgeCheck, Star } from 'lucide-react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

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
    { id: "profile", label: "الملف الشخصي", icon: User, color: "blue" },
    { id: "orders", label: "طلباتي", icon: ShoppingBag, color: "green" },
    { id: "notifications", label: "إعدادات الإشعارات", icon: Bell, color: "purple" },
    { id: "settings", label: "الإعدادات", icon: Settings, color: "gray" },
  ];

  return (
    <Card className="h-fit sticky top-6 border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-red-500 to-red-600"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-red-100/50 dark:from-red-900/20 to-transparent -z-10"></div>
      <CardContent className="p-4 sm:p-6">
        {/* User Info */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative inline-block mb-4 group">
            <div className="relative">
              <Avatar className="h-24 w-24 mx-auto transition-all duration-300 group-hover:scale-105 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                <AvatarImage 
                  src={avatarUrl || ''} 
                  alt={user?.name || 'صورة المستخدم'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <motion.div 
                className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <BadgeCheck className="w-4 h-4" />
              </motion.div>
            </div>
            
            <label 
              htmlFor="avatar-upload" 
              className={cn(
                "absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md",
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
          
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-1">
            {user?.name || 'مستخدم'}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {user?.email}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <Star className="w-3 h-3 mr-1" /> عميل مميز
            </span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-1 gap-2 mb-6 bg-transparent h-auto p-0">
            {tabs.map((tab, index) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <TabsTrigger
                    value={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full justify-start p-3 text-right transition-all duration-300",
                      "rounded-lg border",
                      "hover:bg-gray-50/80 dark:hover:bg-gray-800/30",
                      isActive 
                        ? tab.color === "blue" ? "bg-blue-50/80 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 shadow-sm" :
                          tab.color === "green" ? "bg-green-50/80 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30 shadow-sm" :
                          tab.color === "purple" ? "bg-purple-50/80 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/30 shadow-sm" :
                          "bg-gray-50/80 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/50 shadow-sm"
                        : "bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-100 dark:border-gray-800/30"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <div className={cn(
                        "flex items-center justify-center p-2 rounded-full ml-3 transition-all duration-300",
                        isActive 
                          ? tab.color === "blue" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                            tab.color === "green" ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                            tab.color === "purple" ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" :
                            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-500"
                      )}>
                        <IconComponent className={cn(
                          "w-4 h-4 transition-all duration-300",
                          isActive ? "scale-110" : "scale-100"
                        )} />
                      </div>
                      <span className="text-sm font-medium">{tab.label}</span>
                      {tab.id === "notifications" && (
                        <span className="mr-auto bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-1.5 py-0.5 rounded-full">
                          جديد
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </motion.div>
              );
            })}
          </TabsList>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-center gap-2 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 mt-4 group rounded-lg text-sm py-2"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs">تسجيل الخروج</span>
          </Button>
          
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              شكراً لاستخدامك ديلايت أوتو هب
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              الإصدار 2.5.1
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
