import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ScoreBadge } from '@/components/ScoreBadge';
import type { LatLng } from '@/lib/geo';

const REGION_DELTA = 0.02;

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

export function NearbyMap({ origin, userLocation, markers, onMarkerPress }: NearbyMapProps) {
  const mapRef = useRef<MapView>(null);

  // Recenter once the location fix arrives (map mounted at the fallback first).
  useEffect(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: REGION_DELTA,
          longitudeDelta: REGION_DELTA,
        },
        600,
      );
    }
  }, [userLocation]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: origin.lat,
        longitude: origin.lng,
        latitudeDelta: REGION_DELTA,
        longitudeDelta: REGION_DELTA,
      }}
      showsUserLocation
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          onPress={() => onMarkerPress(marker.id)}
        >
          <ScoreBadge score={marker.score} size={32} />
        </Marker>
      ))}
    </MapView>
  );
}
