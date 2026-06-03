// src/components/RouteControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const redIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/><circle cx="16" cy="13" r="4" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
});

const greenIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#2D6A4F" stroke="#1B4332" stroke-width="1"/><circle cx="16" cy="13" r="4" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
});

export default function RouteControl({ start, end, onRouteReady }) {
  const map = useMap();
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const abortControllerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Abort any ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Remove polyline
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
      // Remove markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [map]);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Clear previous route and markers
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add custom start/end markers
    const startMarker = L.marker([start.lat, start.lng], { icon: redIcon }).bindPopup('Your location');
    const endMarker = L.marker([end.lat, end.lng], { icon: greenIcon }).bindPopup('Destination');
    startMarker.addTo(map);
    endMarker.addTo(map);
    markersRef.current = [startMarker, endMarker];

    // Fetch route from OSRM (replace with your own server if needed)
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    fetch(url, { signal: abortControllerRef.current.signal })
      .then(res => res.json())
      .then(data => {
        if (!isMounted.current) return;
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          const polyline = L.polyline(coords, { color: '#2D6A4F', weight: 5 }).addTo(map);
          polylineRef.current = polyline;
          // Fit the map to the route bounds
          map.fitBounds(polyline.getBounds());
          if (onRouteReady) onRouteReady();
        } else {
          console.warn('No route found');
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Route fetch error:', err);
      });

  }, [map, start, end, onRouteReady]);

  return null;
}