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
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.address) {
        return data.address;
      }
    }
  } catch {
    // Try direct Nominatim fallback
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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
  } catch {
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

export interface GeolocationResult {
  coords: Coordinates;
  address: string;
  accuracyMeters: number;
  source: 'gps_high' | 'gps_network' | 'ip_browser' | 'ip_server' | 'saved_cache';
  isExactGps: boolean;
}

const STORAGE_KEY = 'civicrelief_user_last_location';

export function getSavedUserLocation(): GeolocationResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
      return {
        coords: { lat: parsed.lat, lng: parsed.lng },
        address: parsed.address || `Sector ${parsed.lat.toFixed(3)}°, ${parsed.lng.toFixed(3)}°`,
        accuracyMeters: parsed.accuracyMeters || 1000,
        source: 'saved_cache',
        isExactGps: false,
      };
    }
  } catch {
    // Ignore error
  }
  return null;
}

export function saveUserLocationToCache(coords: Coordinates, address: string, accuracyMeters = 50) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lat: coords.lat,
        lng: coords.lng,
        address,
        accuracyMeters,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Ignore error
  }
}

/**
 * High-reliability multi-tier location resolver:
 * 1. High-accuracy GPS (hardware / mobile satellite)
 * 2. Low-accuracy standard network geolocation (wifi / cell triangulation)
 * 3. Direct browser-side client IP detection
 * 4. Server-side proxy IP fallback
 */
export async function detectRealLocation(): Promise<GeolocationResult> {
  // 1. Try High Accuracy Browser GPS
  if ('geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
        });
      });

      const coords: Coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const address = await reverseGeocode(coords.lat, coords.lng);
      const acc = Math.round(pos.coords.accuracy) || 20;

      saveUserLocationToCache(coords, address, acc);
      return {
        coords,
        address,
        accuracyMeters: acc,
        source: 'gps_high',
        isExactGps: true,
      };
    } catch (err: any) {
      console.info('High-accuracy GPS attempt note:', err?.message || err);
    }

    // 2. Try Standard / Network Browser Geolocation
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 6000,
          maximumAge: 30000,
        });
      });

      const coords: Coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const address = await reverseGeocode(coords.lat, coords.lng);
      const acc = Math.round(pos.coords.accuracy) || 150;

      saveUserLocationToCache(coords, address, acc);
      return {
        coords,
        address,
        accuracyMeters: acc,
        source: 'gps_network',
        isExactGps: true,
      };
    } catch (err: any) {
      console.info('Standard geolocation attempt note:', err?.message || err);
    }
  }

  // 3. Try Direct Browser Client IP Lookup (queries client's actual ISP IP directly from browser)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const ipwhoRes = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (ipwhoRes.ok) {
      const whoData = await ipwhoRes.json();
      if (whoData && whoData.success !== false && typeof whoData.latitude === 'number' && typeof whoData.longitude === 'number') {
        const coords: Coordinates = { lat: whoData.latitude, lng: whoData.longitude };
        const addr = [whoData.city, whoData.region, whoData.country].filter(Boolean).join(', ');
        saveUserLocationToCache(coords, addr, 2500);
        return {
          coords,
          address: addr,
          accuracyMeters: 2500,
          source: 'ip_browser',
          isExactGps: false,
        };
      }
    }
  } catch {
    // Try server IP endpoint fallback
  }

  // 4. Try Server-side IP endpoint
  try {
    const serverRes = await fetch('/api/geo/ip-location');
    if (serverRes.ok) {
      const sData = await serverRes.json();
      if (sData.success && typeof sData.lat === 'number' && typeof sData.lng === 'number') {
        const coords: Coordinates = { lat: sData.lat, lng: sData.lng };
        const addr = sData.formattedAddress || 'Detected Region';
        return {
          coords,
          address: addr,
          accuracyMeters: 3000,
          source: 'ip_server',
          isExactGps: false,
        };
      }
    }
  } catch {
    // Fallback to cached or safe default
  }

  // 5. Fallback to cached location if available
  const cached = getSavedUserLocation();
  if (cached) return cached;

  return {
    coords: { lat: 37.7749, lng: -122.4194 },
    address: 'San Francisco, CA, USA',
    accuracyMeters: 5000,
    source: 'saved_cache',
    isExactGps: false,
  };
}
