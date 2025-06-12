import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PickupPointSelectorProps {
  cityId: string;
  selectedPickupPoint: string;
  onPickupPointChange: (pickupPointId: string) => void;
}

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city_id: string;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  type: string;
}

export default function PickupPointSelector({
  cityId,
  selectedPickupPoint,
  onPickupPointChange
}: PickupPointSelectorProps) {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cityId) {
      fetchPickupPoints();
    } else {
      setPickupPoints([]);
    }
  }, [cityId]);

  const fetchPickupPoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      setPickupPoints(data || []);
      
      // إذا كان هناك نقطة استلام واحدة فقط، نقوم باختيارها تلقائيًا
      if (data && data.length === 1) {
        onPickupPointChange(data[0].id);
      } else if (data && data.length > 0 && !selectedPickupPoint) {
        // إذا كان هناك أكثر من نقطة استلام ولم يتم اختيار أي منهم، نختار الأولى افتراضيًا
        onPickupPointChange(data[0].id);
      } else if (data && data.length === 0) {
        // إذا لم يكن هناك نقاط استلام، نقوم بإعادة تعيين الاختيار
        onPickupPointChange('');
      }
    } catch (error) {
      console.error('Error fetching pickup points:', error);
    } finally {
      setLoading(false);
    }
  };

  // فتح الخريطة للاتجاهات
  const openDirections = (lat: number | null, lng: number | null) => {
    if (lat && lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (pickupPoints.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        لا توجد نقاط استلام متاحة في هذه المدينة
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>اختر نقطة الاستلام</Label>
      <RadioGroup value={selectedPickupPoint} onValueChange={onPickupPointChange}>
        {pickupPoints.map((point) => (
          <div key={point.id} className="flex items-center space-x-2 space-x-reverse border p-3 rounded-md">
            <RadioGroupItem value={point.id} id={`point-${point.id}`} />
            <Label htmlFor={`point-${point.id}`} className="flex-1 cursor-pointer">
              <div className="font-medium">{point.name}</div>
              <div className="text-sm text-gray-500">{point.address}</div>
              <div className="text-xs text-gray-400">{point.type}</div>
            </Label>
            {point.lat && point.lng && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-800"
                onClick={() => openDirections(point.lat, point.lng)}
              >
                <MapPin className="h-4 w-4 mr-1" />
                الاتجاهات
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}