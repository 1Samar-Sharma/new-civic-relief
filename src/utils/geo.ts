import { Coordinates, SafeHavenPoint } from '../types';

/**
 * Calculates distance between two coordinates in Kilometers using Haversine formula
 */
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  if (!c1 || !c2 || typeof c1.lat !== 'number' || typeof c2.lat !== 'number') {
    return 0;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance nicely (e.g. "350 m" or "2.8 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Reverse geocodes coordinates to a human-readable neighborhood/street name
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CivicRelief-App/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential;
        const road = addr.road || addr.street;
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
        const state = addr.state;

        if (neighborhood && city) {
          return `${neighborhood}, ${city}`;
        }
        if (road && city) {
          return `${road}, ${city}`;
        }
        if (city && state) {
          return `${city}, ${state}`;
        }
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(', ').trim();
        }
      }
    }
  } catch (err) {
    // Ignore fetch error and return coordinate fallback
  }

  return `Area near ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}

/**
 * Fetches real nearby Safe Havens (hospitals, fire stations, police stations, clinics, 24/7 pharmacies)
 * from the live backend OpenStreetMap proxy.
 */
export async function fetchNearbyRealSafeHavens(coords: Coordinates): Promise<SafeHavenPoint[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`/api/safe-havens/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=10000`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.safeHavens)) {
        return data.safeHavens;
      }
    }
  } catch (e) {
    console.warn('Real Safe Havens lookup warning:', e);
  }
  return [];
}
