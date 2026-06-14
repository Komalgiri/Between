import * as Location from 'expo-location';
import { Coordinates } from '../utils/distance';

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentCoords = async (): Promise<Coordinates | null> => {
  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

export const startLocationWatch = async (
  onUpdate: (coords: Coordinates) => void
): Promise<Location.LocationSubscription | null> => {
  const granted = await requestLocationPermission();
  if (!granted) return null;

  const initial = await getCurrentCoords();
  if (initial) onUpdate(initial);

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 45_000,
      distanceInterval: 75,
    },
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }
  );
};

export const coordsFromPresence = (
  latitude?: number,
  longitude?: number
): Coordinates | null => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return { latitude, longitude };
};
