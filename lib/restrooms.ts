import type { LatLng } from '@/lib/geo';
import type { AccessType, Bathroom } from '@/lib/types';

// Live, worldwide bathroom data from OpenStreetMap via the Overpass API.
// Overpass is free, needs no key, covers the whole planet, and sends permissive
// CORS headers so it works from the web PWA and native alike. We query
// `amenity=toilets` around the user and map the results into our Bathroom model.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const DEFAULT_RADIUS_M = 3000;
const MAX_RESULTS = 80;
const REQUEST_TIMEOUT_MS = 20000;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(origin: LatLng, radiusM: number): string {
  const { lat, lng } = origin;
  return `[out:json][timeout:25];
(
  node["amenity"="toilets"](around:${radiusM},${lat},${lng});
  way["amenity"="toilets"](around:${radiusM},${lat},${lng});
  relation["amenity"="toilets"](around:${radiusM},${lat},${lng});
);
out center tags ${MAX_RESULTS};`;
}

function truthy(value?: string): boolean {
  return value === 'yes' || value === 'designated' || value === 'only';
}

function mapAccess(tags: Record<string, string>): { access: AccessType; accessNote?: string } {
  const access = tags.access;
  const notes: string[] = [];
  let type: AccessType = 'public';

  if (access === 'customers') {
    type = 'customers';
    notes.push('Customers only');
  } else if (access === 'private' || access === 'permissive' || access === 'key') {
    type = 'customers';
    notes.push(access === 'key' ? 'Key required' : 'Restricted access');
  }

  if (tags.fee === 'yes') {
    if (type === 'public') type = 'customers';
    notes.push(tags.charge ? `Fee: ${tags.charge}` : 'Fee required');
  }

  return { access: type, accessNote: notes.length ? notes.join(' · ') : undefined };
}

/** OSM tags → our persistent amenity ids (see constants/tags.ts). */
function mapAmenities(tags: Record<string, string>): string[] {
  const amenities: string[] = [];
  if (truthy(tags.wheelchair)) amenities.push('accessible');
  if (truthy(tags.unisex) || tags.gender === 'unisex') amenities.push('gender-neutral');
  if (truthy(tags.changing_table)) amenities.push('changing-table');
  if (truthy(tags.bidet)) amenities.push('bidet');
  if (tags['toilets:hand_drying'] === 'electric_hand_dryer') amenities.push('hand-dryer');
  if (tags['toilets:hand_drying'] === 'paper_towel') amenities.push('paper-towels');
  return amenities;
}

function elementToBathroom(el: OverpassElement): Bathroom | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const tags = el.tags ?? {};
  const { access, accessNote } = mapAccess(tags);

  const venue = tags.name || tags.operator || 'Public restroom';
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ').trim();
  const name = street || (tags.level ? `Level ${tags.level}` : 'Public toilet');
  const directionsNote = tags.description || tags.note || undefined;

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    venue,
    lat,
    lng,
    access,
    accessNote,
    directionsNote,
    amenities: mapAmenities(tags),
    createdBy: 'osm',
    createdAt: new Date().toISOString(),
  };
}

async function requestOverpass(endpoint: string, query: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    return (await res.json()) as OverpassResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch public bathrooms near `origin` from OpenStreetMap, sorted by distance.
 * Tries mirror endpoints in order; throws only if every mirror fails.
 */
export async function fetchNearbyBathrooms(
  origin: LatLng,
  radiusM: number = DEFAULT_RADIUS_M,
): Promise<Bathroom[]> {
  const query = buildQuery(origin, radiusM);
  let lastError: unknown;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await requestOverpass(endpoint, query);
      return data.elements
        .map(elementToBathroom)
        .filter((b): b is Bathroom => b !== null);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Overpass request failed');
}
