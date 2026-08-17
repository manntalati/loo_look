import L from 'leaflet';
import { useEffect, useRef } from 'react';

import { formatScore } from '@/lib/format';
import type { LatLng } from '@/lib/geo';
import { Colors, scoreColor } from '@/theme/colors';

import 'leaflet/dist/leaflet.css';

const DEFAULT_ZOOM = 15;

export interface NearbyMapMarker {
  id: string;
  lat: number;
  lng: number;
  score: number | null;
}

export interface NearbyMapProps {
  origin: LatLng;
  userLocation: LatLng | null;
  markers: NearbyMapMarker[];
  onMarkerPress: (id: string) => void;
}

function scoreBadgeHtml(score: number | null): string {
  const size = 32;
  if (score == null) {
    return `<div style="width:${size}px;height:${size}px;border-radius:${size / 2}px;display:flex;align-items:center;justify-content:center;border:1.5px solid ${Colors.labelTertiary};color:${Colors.labelTertiary};font-weight:700;font-size:${size * 0.36}px;background:${Colors.bgElevated};">—</div>`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:${size / 2}px;display:flex;align-items:center;justify-content:center;background:${scoreColor(score)};color:#000;font-weight:700;font-size:${size * 0.36}px;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${formatScore(score)}</div>`;
}

/**
 * Web map fallback for react-native-maps (which has no web support).
 * Uses Leaflet + OpenStreetMap tiles so the PWA has a real interactive map.
 */
export function NearbyMap({ origin, userLocation, markers, onMarkerPress }: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const onMarkerPressRef = useRef(onMarkerPress);
  onMarkerPressRef.current = onMarkerPress;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      userMarkerRef.current = null;
    };
    // origin only used for the initial center; recenter handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render bathroom markers whenever they change.
  useEffect(() => {
    const layer = markerLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markers.forEach((marker) => {
      const icon = L.divIcon({
        html: scoreBadgeHtml(marker.score),
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([marker.lat, marker.lng], { icon })
        .on('click', () => onMarkerPressRef.current(marker.id))
        .addTo(layer);
    });
  }, [markers]);

  // Recenter and drop a user-location dot when the fix arrives.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    map.setView([userLocation.lat, userLocation.lng], DEFAULT_ZOOM, { animate: true });
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:8px;background:${Colors.tint};border:2px solid #fff;box-shadow:0 0 0 4px rgba(10,132,255,0.3);"></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        interactive: false,
      }).addTo(map);
    }
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: Colors.bg }}
    />
  );
}
