import React from 'react';
import { User, MapPin, Phone, Mail, Shield, Home, Building, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LocationFetcher from '@/components/map/LocationFetcher';
import type { Governorate, City } from '@/types/db';

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
      <div className="mb-4 flex items-center">
        <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg ml-3">
          <User className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">المعلومات الشخصية</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">قم بتحديث معلوماتك الشخصية وبيانات التواصل</p>
        </div>
      </div>
      
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400 ml-2" />
            <CardTitle className="text-lg">المعلومات الشخصية</CardTitle>
          </div>
          <CardDescription>جميع المعلومات الشخصية محمية ومؤمنة</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center mb-1">
                  <User className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="name" className="font-medium">الاسم</Label>
                </div>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pr-4 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <div className="flex items-center mb-1">
                  <Mail className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="email" className="font-medium">البريد الإلكتروني</Label>
                </div>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="pr-4 bg-gray-50 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute left-3 top-2 px-1.5 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    مؤمن
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center mb-1">
                  <Phone className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="phone" className="font-medium">رقم الهاتف</Label>
                </div>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pr-4 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <div className="flex items-center mb-1">
                  <Building className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="governorate" className="font-medium">المحافظة</Label>
                </div>
                <Select value={formData.governorate || ''} onValueChange={onGovernorateChange}>
                  <SelectTrigger id="governorate" className="border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors">
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
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center mb-1">
                  <Home className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="city" className="font-medium">المدينة</Label>
                </div>
                <Select value={formData.city || ''} onValueChange={onCityChange}>
                  <SelectTrigger id="city" className="border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div 
                className="space-y-2 md:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="address" className="font-medium">العنوان</Label>
                </div>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="العنوان التفصيلي"
                  className="min-h-[80px] border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </motion.div>

              <div className="md:col-span-2 mt-4 mb-2">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-500 ml-2" />
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">معلومات الموقع</h3>
                </div>
                <div className="h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent my-2"></div>
              </div>
              
              {/* Location selection via Geolocation */}
              <motion.div 
                className="space-y-2 md:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="location" className="font-medium">الموقع</Label>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-red-200 dark:hover:border-red-800/30 transition-colors">
                  <LocationFetcher
                    initialLocation={formData.location_coordinates}
                    onLocationChange={onLocationChange}
                    onLocationClear={onLocationClear}
                  />
                </div>
              </motion.div>
              
              {/* Location description input */}
              <motion.div 
                className="space-y-2 md:col-span-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
              >
                <div className="flex items-center mb-1">
                  <Info className="h-4 w-4 text-red-500 ml-1" />
                  <Label htmlFor="location_description" className="font-medium">وصف الموقع</Label>
                </div>
                <Input
                  id="location_description"
                  name="location_description"
                  value={formData.location_description || ''}
                  onChange={handleInputChange}
                  placeholder="مثال: المنزل أو العمل"
                  className="border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-colors"
                />
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 rounded-md shadow-sm hover:shadow text-sm py-2 px-4 flex items-center gap-1.5"
                  disabled={isUpdating}
                  size="sm"
                >
                  {isUpdating ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      <span className="text-xs">جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs">حفظ التغييرات</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileTab;
