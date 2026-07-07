export interface LatLng {
  lat: number;
  lng: number;
}

/** UIUC Main Quad — used until location permission is granted. */
export const FALLBACK_LOCATION: LatLng = { lat: 40.1092, lng: -88.2272 };

const EARTH_RADIUS_M = 6371000;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** US units: "450 ft" under ~1000 ft, otherwise "0.4 mi". */
export function formatDistance(meters: number): string {
  const feet = meters * 3.28084;
  if (feet < 1000) return `${Math.max(10, Math.round(feet / 10) * 10)} ft`;
  return `${(meters / 1609.34).toFixed(1)} mi`;
}
