
import React from 'react';
import { User, Package, Bell, Settings, LogOut } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

interface ProfileSidebarProps {
  user: {
    name?: string;
    email: string;
    avatar_url?: string;
  } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  avatarUrl: string | null;
  uploadingAvatar: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="sticky top-24">
        <CardContent className="p-4">
          <div className="flex flex-col items-center py-6">
            <div className="relative group mb-4">
              <div className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-md ${uploadingAvatar ? 'opacity-50' : ''}`}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="صورة المستخدم" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all"
              >
                {uploadingAvatar ? (
                  <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                )}
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleAvatarUpload} 
                disabled={uploadingAvatar}
              />
            </div>
            <h3 className="text-xl font-bold mb-1">{user?.name || 'المستخدم'}</h3>
            <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
            <div className="w-full mt-2">
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex flex-col space-y-1">
              <TabsList className="grid grid-cols-1 h-auto bg-transparent mb-4">
                {[
                  { id: "profile", icon: <User className="h-4 w-4 ml-2" />, label: "المعلومات الشخصية" },
                  { id: "orders", icon: <Package className="h-4 w-4 ml-2" />, label: "طلباتي" },
                  { id: "notifications", icon: <Bell className="h-4 w-4 ml-2" />, label: "الإشعارات" },
                  { id: "settings", icon: <Settings className="h-4 w-4 ml-2" />, label: "الإعدادات" }
                ].map(item => (
                  <TabsTrigger 
                    key={item.id}
                    value={item.id} 
                    className={`flex items-center justify-start p-3 mb-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${activeTab === item.id ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileSidebar;
