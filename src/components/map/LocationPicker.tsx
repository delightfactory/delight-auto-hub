import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number } | null;
  onLocationSelected: (location: { lat: number; lng: number } | null) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLocation, onLocationSelected }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const { toast } = useToast();

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        onLocationSelected(coords);
        setLoading(false);
      },
      (err) => {
        toast({ title: 'خطأ في تحديد الموقع', description: err.message, variant: 'destructive' });
        setLoading(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationSelected(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button type="button" onClick={getLocation} disabled={loading}>
          {loading ? 'جاري التحديد...' : 'تحديد موقعي الحالي'}
        </Button>
        {location && (
          <Button type="button" variant="outline" onClick={clearLocation}>
            إزالة التحديد
          </Button>
        )}
      </div>
      {location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-red-500" />
          <span>lat: {location.lat.toFixed(5)}, lng: {location.lng.toFixed(5)}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
