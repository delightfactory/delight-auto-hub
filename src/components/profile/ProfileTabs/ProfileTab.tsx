
import React from 'react';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from '@/components/map/LocationPicker';

interface ProfileTabProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    location_coordinates: { lat: number; lng: number } | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleLocationSelected: (location: { lat: number; lng: number } | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  showLocationPicker: boolean;
  setShowLocationPicker: (show: boolean) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  formData,
  handleInputChange,
  handleLocationSelected,
  handleSubmit,
  isUpdating,
  showLocationPicker,
  setShowLocationPicker
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
          <CardDescription>قم بتحديث معلوماتك الشخصية وبيانات التواصل</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Personal Information Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pr-10"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="pr-10 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pr-10"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="pr-10"
                    placeholder="المدينة"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="العنوان التفصيلي"
                  className="min-h-[80px]"
                />
              </div>

              {/* Location picker section - improved for reliable cleanup */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="location">الموقع على الخريطة</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                  >
                    {showLocationPicker ? 'إخفاء الخريطة' : 'إظهار الخريطة'}
                  </Button>
                </div>
                
                {formData.location_coordinates && !showLocationPicker && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>تم تحديد الموقع</span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-red-600 p-0 h-auto"
                      onClick={() => handleLocationSelected(null)}
                    >
                      إزالة
                    </Button>
                  </div>
                )}
                
                {/* Only render LocationPicker when visible */}
                {showLocationPicker && (
                  <div className="location-picker-container">
                    {/* Mounting a new instance with a unique key */}
                    <LocationPicker 
                      initialLocation={formData.location_coordinates}
                      onLocationSelected={handleLocationSelected}
                      key={`location-picker-${Date.now()}`}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileTab;
