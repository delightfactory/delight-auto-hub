import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationFetcherProps {
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void;
  onLocationClear?: () => void;
  initialLocation?: { lat: number; lng: number; address?: string } | null;
}

const LocationFetcher: React.FC<LocationFetcherProps> = ({ initialLocation, onLocationChange, onLocationClear }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(initialLocation || null);
  const { toast } = useToast();

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=ar,en&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );
          if (!response.ok) throw new Error('فشل جلب العنوان المقترح');

          const data = await response.json();
          const address = data.address || {};

          // استخراج المدينة الفعلية فقط
          const city =
            address.city ||
            address.town ||
            address.village ||
            null;

          // تكوين وصف العنوان المقترح يدويًا لضمان الدقة
          const suggested = [
            address.house_number,
            address.road,
            city,
            address.state,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');

          onLocationChange({
            lat: coords.lat,
            lng: coords.lng,
            address: suggested || data.display_name || '',
          });
        } catch (error: any) {
          toast({
            title: 'خطأ في جلب العنوان',
            description: error.message,
            variant: 'destructive',
          });
          onLocationChange({
            lat: 0,
            lng: 0,
            address: '',
          });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        toast({
          title: 'خطأ في تحديد الموقع',
          description: err.message,
          variant: 'destructive',
        });
        onLocationChange({
          lat: 0,
          lng: 0,
          address: '',
        });
        setLoading(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationChange({ lat: 0, lng: 0, address: '' });
    if (onLocationClear) {
      onLocationClear();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={getLocation}
          disabled={loading}
          variant="outline"
          className="h-9 px-3 text-sm bg-white hover:bg-gray-50 text-gray-800 border-gray-300 hover:border-gray-400 transition-colors duration-200"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
          )}
          {loading ? 'جاري التحديد...' : 'تحديد موقعي'}
        </Button>
        {location && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              clearLocation();
              // تفريغ حقل وصف الموقع
              if (onLocationClear) {
                onLocationClear();
              }
            }}
            className="h-9 px-3 text-sm bg-white hover:bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400 hover:text-gray-800 transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            إزالة
          </Button>
        )}
      </div>
      {location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-red-500" />
          <span>
            lat: {location.lat.toFixed(5)}, lng: {location.lng.toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationFetcher;
