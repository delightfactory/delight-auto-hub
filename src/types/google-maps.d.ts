
/// <reference types="google.maps" />

// Add missing MapMouseEvent type
declare namespace google.maps {
  interface MapMouseEvent {
    latLng?: google.maps.LatLng;
  }
}
