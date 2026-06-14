export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres (Haversine). */
export const haversineKm = (a: Coordinates, b: Coordinates): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const formatDistance = (km: number | null): string => {
  if (km === null) return '—';
  if (km < 0.1) return 'Together';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};
