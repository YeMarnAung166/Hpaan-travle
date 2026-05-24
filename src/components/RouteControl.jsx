// src/components/RouteControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Custom red marker for user location (start point)
const redIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/>
      <circle cx="16" cy="13" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'custom-red-marker',
});

// Custom green marker for destination
const greenIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#2D6A4F" stroke="#1B4332" stroke-width="1"/>
      <circle cx="16" cy="13" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'custom-green-marker',
});

export default function RouteControl({ start, end, onRouteReady }) {
  const map = useMap();
  const controlRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Remove previous route and markers
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
    }

    // Add custom start and end markers
    const startMarker = L.marker([start.lat, start.lng], { icon: redIcon }).bindPopup('Your location');
    const endMarker = L.marker([end.lat, end.lng], { icon: greenIcon }).bindPopup('Destination');
    startMarker.addTo(map);
    endMarker.addTo(map);
    markersRef.current = [startMarker, endMarker];

    // Create routing control without default markers or panel background
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng),
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#2D6A4F', weight: 5 }] },
      addWaypoints: false,
      createMarker: () => null, // prevent default markers
    }).addTo(map);

    controlRef.current = routingControl;
    if (onRouteReady) onRouteReady();

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
      markersRef.current.forEach(m => map.removeLayer(m));
    };
  }, [map, start, end, onRouteReady]);

  return null;
}