'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { NavigationData } from '@/lib/types';

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapController({ navigation }: { navigation: NavigationData }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [navigation.origin.lat, navigation.origin.lng],
      [navigation.destination.lat, navigation.destination.lng],
    ]);

    if (navigation.waypoints) {
      navigation.waypoints.forEach((wp) => {
        bounds.extend([wp.lat, wp.lng]);
      });
    }

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, navigation]);

  return null;
}

interface NavigationEngineProps {
  navigation: NavigationData;
}

export default function NavigationEngine({ navigation }: NavigationEngineProps) {
  const [animatedPositions, setAnimatedPositions] = useState<[number, number][]>([]);

  const routePositions = useMemo(() => {
    const positions: [number, number][] = [
      [navigation.origin.lat, navigation.origin.lng],
    ];
    if (navigation.waypoints) {
      navigation.waypoints.forEach((wp) => {
        positions.push([wp.lat, wp.lng]);
      });
    }
    positions.push([navigation.destination.lat, navigation.destination.lng]);
    return positions;
  }, [navigation]);

  // Animate the polyline
  useEffect(() => {
    setAnimatedPositions([]);
    let index = 0;

    const interval = setInterval(() => {
      if (index < routePositions.length) {
        setAnimatedPositions((prev) => [...prev, routePositions[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [routePositions]);

  const center: [number, number] = [navigation.origin.lat, navigation.origin.lng];

  return (
    <div className="w-full h-full relative flex">
      {/* Map */}
      <div className="flex-1 h-full relative">
        <MapContainer
          center={center}
          zoom={navigation.zoom || 10}
          className="w-full h-full rounded-lg"
          style={{ background: '#111' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController navigation={navigation} />

          {/* Origin marker */}
          <Marker position={[navigation.origin.lat, navigation.origin.lng]} icon={defaultIcon}>
            <Popup>
              <strong>📍 Start:</strong> {navigation.origin.label}
            </Popup>
          </Marker>

          {/* Destination marker */}
          <Marker position={[navigation.destination.lat, navigation.destination.lng]} icon={redIcon}>
            <Popup>
              <strong>🏁 End:</strong> {navigation.destination.label}
            </Popup>
          </Marker>

          {/* Waypoint markers */}
          {navigation.waypoints?.map((wp, i) => (
            <Marker key={i} position={[wp.lat, wp.lng]} icon={defaultIcon}>
              <Popup>{wp.label || `Waypoint ${i + 1}`}</Popup>
            </Marker>
          ))}

          {/* Animated route polyline */}
          {animatedPositions.length > 1 && (
            <Polyline
              positions={animatedPositions}
              pathOptions={{
                color: '#E63939',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />
          )}

          {/* Full route (faded) */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#E63939',
              weight: 2,
              opacity: 0.2,
            }}
          />
        </MapContainer>

        {/* Overlay label */}
        <div className="absolute top-3 left-3 z-[1000] px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
          <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">
            Navigation Map
          </span>
        </div>
      </div>

      {/* Directions panel */}
      {navigation.steps && navigation.steps.length > 0 && (
        <div className="w-64 h-full bg-black/80 border-l border-white/10 overflow-y-auto p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className="text-[#E63939]">📋</span> Directions
          </h3>
          <div className="space-y-2">
            {navigation.steps.map((step, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-[#E63939] font-bold mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-white/70">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
            <p>From: {navigation.origin.label}</p>
            <p>To: {navigation.destination.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
