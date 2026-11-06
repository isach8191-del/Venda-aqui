import { Geolocation } from '@capacitor/geolocation';

export interface DetectedLocationResult {
  location: string;
  country: string; // 2-letter uppercase ISO code, e.g. 'MZ'
  currency: string;
  source: 'gps' | 'fallback';
}

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  MZ: 'MZN',
  ZA: 'ZAR',
  PT: 'EUR',
  BR: 'BRL',
  AO: 'AOA',
  ZW: 'USD',
  TZ: 'TZS',
  US: 'USD',
  GB: 'GBP',
  KE: 'KES',
  CV: 'CVE',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  CN: 'CNY',
  IN: 'INR',
  RU: 'RUB',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  CH: 'EUR',
  CA: 'USD',
  AU: 'USD',
  NG: 'USD',
  GH: 'USD',
  CD: 'USD',
  RW: 'USD',
  UG: 'USD',
  NA: 'ZAR',
  BW: 'USD',
};

export function getCurrencyForCountry(countryCode?: string): string {
  if (!countryCode) return 'MZN';
  const clean = countryCode.trim().toUpperCase();
  return COUNTRY_CURRENCY_MAP[clean] || 'MZN';
}

// Local storage keys
const KEY_DECLINED_AT = 'hic_geo_declined_at';
const KEY_AUTO_ENABLED = 'hic_geo_auto_enabled';
const KEY_LAST_CHECK_AT = 'hic_geo_last_check_at';
const KEY_LAST_LOCATION_TEXT = 'hic_geo_last_location_text';

// 7 days in milliseconds
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// 1 hour in milliseconds
const ONE_HOUR_MS = 60 * 60 * 1000;

export function isAutoLocationEnabled(): boolean {
  try {
    const val = localStorage.getItem(KEY_AUTO_ENABLED);
    // If not set yet, default is false until permission accepted
    return val === 'true';
  } catch {
    return false;
  }
}

export function setAutoLocationEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEY_AUTO_ENABLED, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function shouldShowPermissionPrompt(): boolean {
  try {
    // If user already enabled it, no need to ask permission prompt again
    if (localStorage.getItem(KEY_AUTO_ENABLED) === 'true') {
      return false;
    }
    const declinedAtStr = localStorage.getItem(KEY_DECLINED_AT);
    if (!declinedAtStr) return true;
    const declinedAt = parseInt(declinedAtStr, 10);
    if (isNaN(declinedAt)) return true;
    // Don't insist if declined within last week
    return Date.now() - declinedAt >= ONE_WEEK_MS;
  } catch {
    return true;
  }
}

export function recordPermissionDeclined(): void {
  try {
    localStorage.setItem(KEY_DECLINED_AT, Date.now().toString());
    localStorage.setItem(KEY_AUTO_ENABLED, 'false');
  } catch {
    // Ignore
  }
}

export function recordPermissionAccepted(): void {
  try {
    localStorage.removeItem(KEY_DECLINED_AT);
    localStorage.setItem(KEY_AUTO_ENABLED, 'true');
  } catch {
    // Ignore
  }
}

export function isCheckDue(force: boolean = false): boolean {
  if (force) return true;
  try {
    const lastCheckStr = localStorage.getItem(KEY_LAST_CHECK_AT);
    if (!lastCheckStr) return true;
    const lastCheck = parseInt(lastCheckStr, 10);
    if (isNaN(lastCheck)) return true;
    return Date.now() - lastCheck >= ONE_HOUR_MS;
  } catch {
    return true;
  }
}

export function recordCheckTimestamp(): void {
  try {
    localStorage.setItem(KEY_LAST_CHECK_AT, Date.now().toString());
  } catch {
    // Ignore
  }
}

export function getLastDetectedLocationText(): string {
  try {
    return localStorage.getItem(KEY_LAST_LOCATION_TEXT) || '';
  } catch {
    return '';
  }
}

export function setLastDetectedLocationText(text: string): void {
  try {
    localStorage.setItem(KEY_LAST_LOCATION_TEXT, text);
  } catch {
    // Ignore
  }
}

// Rate limiter helper for reverse geocoding (max 1 req/sec)
let lastGeocodeRequestTime = 0;
async function throttleGeocode(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastGeocodeRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastGeocodeRequestTime = Date.now();
}

/**
 * Fallback: deduce country from timezone and navigator.language
 */
export function deduceCountryFromTimezoneAndLocale(): { country: string; location: string } {
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    tz = '';
  }

  const tzCountryMap: Record<string, { country: string; location: string }> = {
    'Africa/Maputo': { country: 'MZ', location: 'Maputo' },
    'Africa/Johannesburg': { country: 'ZA', location: 'Joanesburgo' },
    'Europe/Lisbon': { country: 'PT', location: 'Lisboa' },
    'Atlantic/Madeira': { country: 'PT', location: 'Funchal' },
    'Atlantic/Azores': { country: 'PT', location: 'Ponta Delgada' },
    'America/Sao_Paulo': { country: 'BR', location: 'São Paulo' },
    'America/Rio_de_Janeiro': { country: 'BR', location: 'Rio de Janeiro' },
    'America/Bahia': { country: 'BR', location: 'Salvador' },
    'America/Fortaleza': { country: 'BR', location: 'Fortaleza' },
    'America/Recife': { country: 'BR', location: 'Recife' },
    'America/Belem': { country: 'BR', location: 'Belém' },
    'America/Manaus': { country: 'BR', location: 'Manaus' },
    'America/Cuiaba': { country: 'BR', location: 'Cuiabá' },
    'America/Porto_Velho': { country: 'BR', location: 'Porto Velho' },
    'America/Rio_Branco': { country: 'BR', location: 'Rio Branco' },
    'America/Boa_Vista': { country: 'BR', location: 'Boa Vista' },
    'America/Maceio': { country: 'BR', location: 'Maceió' },
    'America/Campo_Grande': { country: 'BR', location: 'Campo Grande' },
    'America/Noronha': { country: 'BR', location: 'Fernando de Noronha' },
    'Africa/Luanda': { country: 'AO', location: 'Luanda' },
    'Africa/Harare': { country: 'ZW', location: 'Harare' },
    'Africa/Dar_es_Salaam': { country: 'TZ', location: 'Dar es Salaam' },
    'Africa/Nairobi': { country: 'KE', location: 'Nairobi' },
    'Atlantic/Cape_Verde': { country: 'CV', location: 'Praia' },
    'Europe/Madrid': { country: 'ES', location: 'Madrid' },
    'Europe/Paris': { country: 'FR', location: 'Paris' },
    'Europe/Berlin': { country: 'DE', location: 'Berlim' },
    'Europe/London': { country: 'GB', location: 'Londres' },
    'America/New_York': { country: 'US', location: 'Nova Iorque' },
    'America/Chicago': { country: 'US', location: 'Chicago' },
    'America/Denver': { country: 'US', location: 'Denver' },
    'America/Los_Angeles': { country: 'US', location: 'Los Angeles' },
    'America/Phoenix': { country: 'US', location: 'Phoenix' },
    'Pacific/Honolulu': { country: 'US', location: 'Honolulu' },
    'Asia/Shanghai': { country: 'CN', location: 'Xangai' },
    'Asia/Chongqing': { country: 'CN', location: 'Chongqing' },
    'Asia/Kolkata': { country: 'IN', location: 'Nova Deli' },
    'Europe/Moscow': { country: 'RU', location: 'Moscovo' },
  };

  if (tz && tzCountryMap[tz]) {
    return tzCountryMap[tz];
  }

  // Deduce from navigator.language locale country if available (e.g. pt-BR -> BR)
  try {
    const lang = (navigator.language || '').trim();
    if (lang.includes('-')) {
      const parts = lang.split('-');
      const region = parts[parts.length - 1].toUpperCase();
      if (region.length === 2) {
        return { country: region, location: region };
      }
    }
  } catch {
    // Ignore
  }

  // Default fallback
  return { country: 'MZ', location: 'Maputo' };
}

/**
 * Reverse geocode latitude and longitude to neighbourhood, city, country
 * Uses 24h localStorage cache (keyed by ~0.01 deg lat/lon) and 1s rate limiter.
 * Does NOT return lat/lon to enforce user constraint: "NÃO gravar latitude/longitude no Firestore".
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  localityLanguage: string = 'pt'
): Promise<{ location: string; country: string } | null> {
  // Round to ~0.01 degree (~1.1km) for caching
  const latKey = latitude.toFixed(2);
  const lonKey = longitude.toFixed(2);
  const cacheKey = `hic_geo_cache_${latKey}_${lonKey}_${localityLanguage}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Valid for 24 hours
      if (parsed && parsed.ts && Date.now() - parsed.ts < 24 * 60 * 60 * 1000 && parsed.location) {
        return { location: parsed.location, country: parsed.country };
      }
    }
  } catch {
    // Ignore cache parse error
  }

  // Primary API: BigDataCloud client reverse-geocode (free, client-side, no API key required)
  await throttleGeocode();
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${localityLanguage}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const country = (data.countryCode || '').toUpperCase() || 'MZ';
      const city = data.city || data.locality || data.principalSubdivision || '';
      const locality = data.locality && data.locality !== city ? data.locality : '';
      
      let location = city;
      if (locality && city) {
        location = `${locality}, ${city}`;
      } else if (!location && data.principalSubdivision) {
        location = data.principalSubdivision;
      }
      if (!location) {
        location = data.countryName || country;
      }

      const result = { location, country };
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ...result, ts: Date.now() }));
      } catch {
        // Storage quota ignore
      }
      return result;
    }
  } catch {
    // BigDataCloud failed or timed out, attempt Nominatim fallback
  }

  // Fallback API: OpenStreetMap Nominatim
  await throttleGeocode();
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': localityLanguage,
        'User-Agent': 'HicVenditurApp/1.0',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const country = (addr.country_code || '').toUpperCase() || 'MZ';
      const neighbourhood = addr.suburb || addr.neighbourhood || addr.quarter || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      
      let location = '';
      if (neighbourhood && city) {
        location = `${neighbourhood}, ${city}`;
      } else if (city) {
        location = city;
      } else if (addr.state) {
        location = addr.state;
      } else {
        location = addr.country || country;
      }

      const result = { location, country };
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ...result, ts: Date.now() }));
      } catch {
        // Ignore
      }
      return result;
    }
  } catch {
    // Nominatim also failed
  }

  return null;
}

/**
 * Gets current coordinates using @capacitor/geolocation with navigator.geolocation fallback
 */
async function getDeviceCoordinates(): Promise<{ latitude: number; longitude: number }> {
  // Try Capacitor Geolocation first
  try {
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    if (pos && pos.coords) {
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    }
  } catch {
    // Fallback to web navigator.geolocation
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  throw new Error('Geolocalização não disponível');
}

/**
 * Full detection workflow:
 * 1. Checks GPS position
 * 2. Reverse geocodes with BigDataCloud (fallback Nominatim)
 * 3. Falls back to TimeZone/Locale if GPS fails
 * 4. NEVER exposes or stores lat/lon
 */
export async function detectCurrentLocation(
  langCode: string = 'pt'
): Promise<DetectedLocationResult> {
  try {
    const coords = await getDeviceCoordinates();
    const geocoded = await reverseGeocode(coords.latitude, coords.longitude, langCode);
    if (geocoded && geocoded.location && geocoded.country) {
      const currency = getCurrencyForCountry(geocoded.country);
      const text = `${geocoded.location}, ${geocoded.country}`;
      setLastDetectedLocationText(text);
      recordCheckTimestamp();
      return {
        location: geocoded.location,
        country: geocoded.country,
        currency,
        source: 'gps',
      };
    }
  } catch {
    // GPS denied or failed
  }

  // Fallback to Timezone & Locale
  const fallback = deduceCountryFromTimezoneAndLocale();
  const currency = getCurrencyForCountry(fallback.country);
  const text = `${fallback.location}, ${fallback.country}`;
  setLastDetectedLocationText(text);
  recordCheckTimestamp();

  return {
    location: fallback.location,
    country: fallback.country,
    currency,
    source: 'fallback',
  };
}
