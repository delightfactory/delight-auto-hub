import { supabase } from "@/integrations/supabase/client";
import type { Governorate, City } from '@/types/db';

// تعريف واجهات البيانات
export interface DBGovernorate {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBCity {
  id: string;
  name_ar: string;
  name_en: string;
  governorate_id: string;
  delivery_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  delivery_days: string[] | null;
}

// تحويل بيانات المحافظة من قاعدة البيانات إلى الصيغة المستخدمة في التطبيق
const mapGovernorateToAppFormat = (dbGovernorate: DBGovernorate, cities: DBCity[]): Governorate => {
  return {
    id: dbGovernorate.id,
    name_ar: dbGovernorate.name_ar,
    name_en: dbGovernorate.name_en,
    cities: cities
      .filter(city => city.governorate_id === dbGovernorate.id && city.is_active)
      .map(city => ({
        name_ar: city.name_ar,
        name_en: city.name_en
      }))
  };
};

// خدمة إدارة المواقع (المدن والمحافظات)
export const locationService = {
  // جلب جميع المحافظات النشطة
  getGovernorates: async (): Promise<DBGovernorate[]> => {
    try {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .eq('is_active', true)
        .order('name_ar', { ascending: true });
      
      if (error) {
        console.error('Error fetching governorates:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getGovernorates:', error);
      return [];
    }
  },
  
  // جلب جميع المدن النشطة
  getCities: async (governorateId?: string): Promise<DBCity[]> => {
    try {
      let query = supabase
        .from('cities')
        .select('*')
        .eq('is_active', true);
      
      // إذا تم تحديد معرف محافظة، قم بتصفية المدن حسب المحافظة
      if (governorateId) {
        query = query.eq('governorate_id', governorateId);
      }
      
      const { data, error } = await query.order('name_ar', { ascending: true });
      
      if (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getCities:', error);
      return [];
    }
  },
  
  // جلب شجرة المحافظات والمدن بالصيغة المستخدمة في التطبيق
  getLocationTree: async (): Promise<Governorate[]> => {
    try {
      // جلب جميع المحافظات النشطة
      const governorates = await locationService.getGovernorates();
      
      // جلب جميع المدن النشطة
      const cities = await locationService.getCities();
      
      // تحويل البيانات إلى الصيغة المطلوبة
      return governorates.map(gov => mapGovernorateToAppFormat(gov, cities));
    } catch (error) {
      console.error('Error in getLocationTree:', error);
      return [];
    }
  },
  
  // جلب محافظة محددة مع مدنها
  getGovernorateWithCities: async (governorateId: string): Promise<Governorate | null> => {
    try {
      // جلب المحافظة
      const { data: governorate, error: govError } = await supabase
        .from('governorates')
        .select('*')
        .eq('id', governorateId)
        .eq('is_active', true)
        .single();
      
      if (govError || !governorate) {
        console.error('Error fetching governorate:', govError);
        return null;
      }
      
      // جلب مدن المحافظة
      const cities = await locationService.getCities(governorateId);
      
      // تحويل البيانات إلى الصيغة المطلوبة
      return mapGovernorateToAppFormat(governorate, cities);
    } catch (error) {
      console.error('Error in getGovernorateWithCities:', error);
      return null;
    }
  },
  
  // جلب مدينة محددة
  getCityById: async (cityId: string): Promise<DBCity | null> => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching city:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getCityById:', error);
      return null;
    }
  },
  
  // جلب تكلفة الشحن لمدينة محددة
  getDeliveryFee: async (cityId: string): Promise<number> => {
    try {
      const city = await locationService.getCityById(cityId);
      return city ? city.delivery_fee : 0;
    } catch (error) {
      console.error('Error in getDeliveryFee:', error);
      return 0;
    }
  }
};