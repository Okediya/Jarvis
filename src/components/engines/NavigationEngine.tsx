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

function MapController({ positions }: { positions: {lat: number, lng: number}[] }) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;

    if (positions.length === 1) {
      // Single location (e.g. "Map of San Francisco")
      map.setView([positions[0].lat, positions[0].lng], 12);
    } else {
      // Multiple locations (e.g. "Directions array")
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);

  return null;
}

interface NavigationEngineProps {
  navigation: NavigationData;
}

export default function NavigationEngine({ navigation }: NavigationEngineProps) {
  // Safely parse robust numbers from the model output
  const isValidPoint = (lat: any, lng: any): boolean => {
    return lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));
  };

  const routePositions = useMemo(() => {
    const pos: {lat: number, lng: number}[] = [];
    
    if (isValidPoint(navigation.origin?.lat, navigation.origin?.lng)) {
      pos.push({lat: Number(navigation.origin.lat), lng: Number(navigation.origin.lng)});
    }
    
    if (navigation.waypoints && Array.isArray(navigation.waypoints)) {
      navigation.waypoints.forEach((wp) => {
        if (isValidPoint(wp?.lat, wp?.lng)) {
          pos.push({lat: Number(wp.lat), lng: Number(wp.lng)});
        }
      });
    }
    
    if (isValidPoint(navigation.destination?.lat, navigation.destination?.lng)) {
      pos.push({lat: Number(navigation.destination.lat), lng: Number(navigation.destination.lng)});
    }
    
    return pos;
  }, [navigation]);

  // Fallback center for initial render block
  const center: [number, number] = routePositions.length > 0 ? [routePositions[0].lat, routePositions[0].lng] : [0, 0];

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

          <MapController positions={routePositions} />

          {/* Origin marker */}
          {isValidPoint(navigation.origin?.lat, navigation.origin?.lng) && (
            <Marker position={[Number(navigation.origin.lat), Number(navigation.origin.lng)]} icon={defaultIcon}>
              <Popup>
                <strong>📍 Start:</strong> {navigation.origin.label || 'Location'}
              </Popup>
            </Marker>
          )}

          {/* Destination marker */}
          {isValidPoint(navigation.destination?.lat, navigation.destination?.lng) && (
            <Marker position={[Number(navigation.destination.lat), Number(navigation.destination.lng)]} icon={redIcon}>
              <Popup>
                <strong>🏁 End:</strong> {navigation.destination.label || 'Destination'}
              </Popup>
            </Marker>
          )}

          {/* Waypoint markers */}
          {navigation.waypoints?.map((wp, i) => {
            if (!isValidPoint(wp?.lat, wp?.lng)) return null;
            return (
              <Marker key={i} position={[Number(wp.lat), Number(wp.lng)]} icon={defaultIcon}>
                <Popup>{wp.label || `Waypoint ${i + 1}`}</Popup>
              </Marker>
            );
          })}

          {/* Solid Route */}
          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#E63939',
                weight: 4,
                opacity: 0.8,
              }}
            />
          )}
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
        <div className="w-64 h-full bg-black/80 border-l border-white/10 overflow-y-auto p-4 flex flex-col">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className="text-[#E63939]">📋</span> Details
          </h3>
          <div className="space-y-2 flex-grow">
            {navigation.steps.map((step, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-[#E63939] font-bold mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-white/70">{step}</p>
              </div>
            ))}
          </div>
          {isValidPoint(navigation.destination?.lat, navigation.destination?.lng) && (
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
              <p>From: {navigation.origin?.label || 'Origin'}</p>
              <p>To: {navigation.destination?.label || 'Destination'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
