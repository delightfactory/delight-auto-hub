import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ShippingFormProps {
  onShippingCostChange: (cost: number) => void;
  selectedGovernorate: string;
  selectedCity: string;
  onGovernorateChange: (governorate: string) => void;
  onCityChange: (city: string, shippingCost: number) => void;
}

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
}

interface City {
  id: string;
  name_ar: string;
  name_en: string;
  governorate_id: string;
  delivery_fee: number;
  is_active: boolean;
}

export default function ShippingForm({
  onShippingCostChange,
  selectedGovernorate,
  selectedCity,
  onGovernorateChange,
  onCityChange
}: ShippingFormProps) {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernorates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedGovernorate && cities.length > 0) {
      const filtered = cities.filter(city => city.governorate_id === selectedGovernorate);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [selectedGovernorate, cities]);

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .eq('is_active', true)
        .order('name_ar', { ascending: true });
      
      if (error) throw error;
      setGovernorates(data || []);
    } catch (error) {
      console.error('Error fetching governorates:', error);
    }
  };

  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name_ar', { ascending: true });
      
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGovernorateChange = (value: string) => {
    onGovernorateChange(value);
    // عند تغيير المحافظة، نقوم بإعادة تعيين المدينة
    onCityChange('', 0);
  };

  // تنسيق العملة مع ضمان ظهور الأرقام باللغة الإنجليزية
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(value);
    
  const handleCityChange = (value: string) => {
    const selectedCity = cities.find(city => city.id === value);
    if (selectedCity) {
      onCityChange(value, selectedCity.delivery_fee);
      onShippingCostChange(selectedCity.delivery_fee);
      
      // عرض رسالة توضيحية عن تكلفة الشحن
      if (selectedCity.delivery_fee > 0) {
        console.log(`تكلفة الشحن للمدينة المختارة: ${formatCurrency(selectedCity.delivery_fee)}`);
      } else {
        console.log('الشحن مجاني للمدينة المختارة');
      }
    } else {
      onCityChange(value, 0);
      onShippingCostChange(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="governorate">المحافظة</Label>
        <Select 
          value={selectedGovernorate} 
          onValueChange={handleGovernorateChange}
        >
          <SelectTrigger id="governorate">
            <SelectValue placeholder="اختر المحافظة" />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((governorate) => (
              <SelectItem key={governorate.id} value={governorate.id}>
                {governorate.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">المدينة</Label>
        {loading ? (
          <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        ) : (
          <Select 
            value={selectedCity} 
            onValueChange={handleCityChange}
            disabled={!selectedGovernorate || filteredCities.length === 0}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {filteredCities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
