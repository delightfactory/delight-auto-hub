import React from 'react';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LocationFetcher from '@/components/map/LocationFetcher';
import type { Governorate, City } from '@/lib/egyptian-locations';

interface ProfileTabProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    location_coordinates: { lat: number; lng: number } | null;
    location_description?: string;
    governorate?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void;
  onLocationClear: () => void;
  egyptianGovernorates: Governorate[];
  availableCities: City[];
  onGovernorateChange: (gov: string) => void;
  onCityChange: (city: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  setFormData: (data: any) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ 
  formData, 
  handleInputChange, 
  egyptianGovernorates, 
  availableCities, 
  onGovernorateChange, 
  onCityChange, 
  handleSubmit, 
  isUpdating, 
  setFormData,
  onLocationChange,
  onLocationClear 
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
              
              {/* Governorate Select */}
              <div className="space-y-2">
                <Label htmlFor="governorate">المحافظة</Label>
                <Select value={formData.governorate || ''} onValueChange={onGovernorateChange}>
                  <SelectTrigger id="governorate">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {egyptianGovernorates.map(gov => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* City Select */}
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Select value={formData.city || ''} onValueChange={onCityChange}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city.name_en} value={city.name_en}>
                        {city.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Location selection via Geolocation */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">الموقع</Label>
                <LocationFetcher
                  initialLocation={formData.location_coordinates}
                  onLocationChange={onLocationChange}
                  onLocationClear={onLocationClear}
                />
              </div>
              {/* Location description input */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location_description">وصف الموقع</Label>
                <Input
                  id="location_description"
                  name="location_description"
                  value={formData.location_description || ''}
                  onChange={handleInputChange}
                  placeholder="مثال: المنزل أو العمل"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                className="h-10 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 rounded-lg"
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
