/**
 * geocodingService.js
 * Reverse geocoding using OpenStreetMap Nominatim API (free, no API key needed).
 * Converts lat/lon → detailed human-readable address.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

// Simple in-memory cache: avoid re-fetching the same coords repeatedly
const cache = new Map();
const CACHE_PRECISION = 4; // round to 4 decimal places (~11m accuracy)

const roundCoord = (val) => Math.round(val * 10 ** CACHE_PRECISION) / 10 ** CACHE_PRECISION;

/**
 * Build a structured address object from Nominatim response.
 */
const parseAddress = (data) => {
  const a = data.address || {};

  // Road / street
  const road = a.road || a.pedestrian || a.path || a.footway || a.street || '';

  // Area / neighbourhood / suburb
  const area =
    a.neighbourhood || a.suburb || a.quarter || a.residential || a.village || a.town || '';

  // Building / amenity / shop
  const building = a.building || a.amenity || a.shop || a.office || a.tourism || '';

  // City
  const city = a.city || a.town || a.village || a.municipality || a.county || '';

  // State
  const state = a.state || a.region || '';

  // Postcode & country
  const postcode = a.postcode || '';
  const country  = a.country || '';

  // Build a human-readable one-line address (most specific → least specific)
  const parts = [building, road, area, city, state, postcode].filter(Boolean);
  const formatted = parts.join(', ') || data.display_name || 'Unknown location';

  return { road, area, building, city, state, postcode, country, formatted };
};

/**
 * Reverse geocode a lat/lon coordinate pair.
 * Returns { road, area, building, city, state, postcode, country, formatted }
 */
const reverseGeocode = async (latitude, longitude) => {
  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  const key = `${lat},${lon}`;

  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          // Nominatim requires a User-Agent / Referer header
          'Accept-Language': 'en',
        },
      }
    );

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data = await res.json();
    const address = parseAddress(data);

    // Cache for 5 minutes
    cache.set(key, address);
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);

    return address;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err.message);
    return {
      road: '', area: '', building: '', city: '', state: '',
      postcode: '', country: '',
      formatted: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    };
  }
};

export default { reverseGeocode };
