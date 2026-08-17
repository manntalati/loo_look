export type AccessType = 'public' | 'customers' | 'code';

export interface Bathroom {
  id: string;
  /** Which bathroom within the venue, e.g. "Basement — Quiet Floor". */
  name: string;
  /** Host venue, e.g. "Grainger Engineering Library". */
  venue: string;
  lat: number;
  lng: number;
  access: AccessType;
  /** How to get in, e.g. "Code on receipt", "Ask barista for key". */
  accessNote?: string;
  /** How to find it once inside, e.g. "Past the info desk, down the stairs". */
  directionsNote?: string;
  /**
   * Persistent amenity ids known at import time (e.g. from OpenStreetMap tags),
   * before anyone has rated it. Merged with rating-aggregated amenities in the
   * store so imported bathrooms still surface in amenity filters.
   */
  amenities?: string[];
  createdBy: string;
  createdAt: string; // ISO 8601
}

export interface Rating {
  id: string;
  bathroomId: string;
  userId: string;
  /** 0–10, one decimal. */
  score: number;
  /** Persistent amenity tag ids — aggregate onto the bathroom (see constants/tags.ts). */
  amenities: string[];
  /** Visit-condition tag ids — belong to this rating only. */
  conditions: string[];
  caption?: string;
  photoUri?: string;
  createdAt: string; // ISO 8601
}

export interface User {
  id: string;
  name: string;
}
