
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number } | null;
  onLocationSelected: (location: { lat: number; lng: number } | null) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLocation, onLocationSelected }) => {
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || { lat: 24.7136, lng: 46.6753 } // Default to Riyadh, Saudi Arabia if no initial location
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const apiKey = "AIzaSyAPptCkGAVzsqKNUbOXKqP77FIL73dHkTQ"; // Google Maps API key

  // Load the Google Maps script
  useEffect(() => {
    // First check if the script is already loaded
    if (typeof window.google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
      
      // Store a reference to the script
      scriptRef.current = script;
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Clean up if component unmounts during load
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
    };
  }, []);

  // Initialize the map once the script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    setLoading(true);
    
    try {
      // Create the map
      const mapOptions: google.maps.MapOptions = {
        center: currentLocation || { lat: 24.7136, lng: 46.6753 },
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };
      
      // Make sure the map element exists before creating the map
      if (mapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        
        // Create a marker if there's a current location
        if (currentLocation) {
          markerRef.current = new window.google.maps.Marker({
            position: currentLocation,
            map: googleMapRef.current,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
          });
          
          // Update location when marker is dragged
          markerRef.current.addListener("dragend", () => {
            if (markerRef.current) {
              const position = markerRef.current.getPosition();
              if (position) {
                const newLocation = { lat: position.lat(), lng: position.lng() };
                setCurrentLocation(newLocation);
                onLocationSelected(newLocation);
              }
            }
          });
        }
        
        // Allow clicking on the map to place marker
        const map = googleMapRef.current;
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const clickedLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            
            // Update existing marker or create a new one
            if (markerRef.current) {
              markerRef.current.setPosition(clickedLocation);
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
              });
              
              // Add drag listener to new marker
              markerRef.current.addListener("dragend", () => {
                if (markerRef.current) {
                  const position = markerRef.current.getPosition();
                  if (position) {
                    const newLocation = { lat: position.lat(), lng: position.lng() };
                    setCurrentLocation(newLocation);
                    onLocationSelected(newLocation);
                  }
                }
              });
            }
            
            setCurrentLocation(clickedLocation);
            onLocationSelected(clickedLocation);
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "خطأ في تحميل الخريطة",
        description: "حدث خطأ أثناء تحميل الخريطة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    
    // Cleanup function to properly dispose of Google Maps objects
    return () => {
      // Remove event listeners and references
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      
      // Clear the map reference
      googleMapRef.current = null;
    };
  }, [mapLoaded, mapRef, onLocationSelected, currentLocation]);
  
  // Function to get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Update marker position
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(userLocation);
            
            if (markerRef.current) {
              markerRef.current.setPosition(userLocation);
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: userLocation,
                map: googleMapRef.current,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
              });
              
              // Add drag listener
              markerRef.current.addListener("dragend", () => {
                if (markerRef.current) {
                  const position = markerRef.current.getPosition();
                  if (position) {
                    const newLocation = { lat: position.lat(), lng: position.lng() };
                    setCurrentLocation(newLocation);
                    onLocationSelected(newLocation);
                  }
                }
              });
            }
            
            setCurrentLocation(userLocation);
            onLocationSelected(userLocation);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          toast({
            title: "خطأ في تحديد الموقع",
            description: "لم نتمكن من الوصول إلى موقعك الحالي. يرجى التحقق من إعدادات الموقع.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "خدمة تحديد الموقع غير متوفرة",
        description: "متصفحك لا يدعم خدمة تحديد الموقع الجغرافي.",
        variant: "destructive",
      });
    }
  };

  // Clear the selected location
  const clearLocation = () => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    setCurrentLocation(null);
    onLocationSelected(null);
  };
  
  return (
    <div className="w-full mt-2">
      <div className="flex justify-end space-x-2 mb-2 rtl:space-x-reverse">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex items-center gap-1"
          disabled={loading}
        >
          {loading ? <Loader className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
          <span>تحديد موقعي الحالي</span>
        </Button>
        
        {currentLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearLocation}
            className="flex items-center gap-1"
            disabled={loading}
          >
            <span>إزالة التحديد</span>
          </Button>
        )}
      </div>
      
      <div 
        ref={mapRef}
        className="w-full h-[280px] rounded-md border bg-gray-100 overflow-hidden relative"
      >
        {loading && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-delight-600" />
          </div>
        )}
      </div>
      
      {currentLocation && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          يمكنك سحب العلامة على الخريطة لتحديد موقعك بدقة
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
