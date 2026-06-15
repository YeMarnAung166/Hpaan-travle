// src/components/RouteControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const redIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/><circle cx="16" cy="13" r="4" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'custom-marker',
});

const greenIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#2D6A4F" stroke="#1B4332" stroke-width="1"/><circle cx="16" cy="13" r="4" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'custom-marker',
});

export default function RouteControl({ start, end, onRouteReady }) {
  const map = useMap();
  const controlRef = useRef(null);
  const markersRef = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (controlRef.current && map && map.removeControl) {
        try { map.removeControl(controlRef.current); } catch (e) {}
        controlRef.current = null;
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [map]);

  useEffect(() => {
    if (!map || !start || !end) return;

    const initRouting = () => {
      if (!isMounted.current) return;

      // Remove previous control and markers
      if (controlRef.current) {
        try { map.removeControl(controlRef.current); } catch (e) {}
        controlRef.current = null;
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add custom start/end markers
      const startMarker = L.marker([start.lat, start.lng], { icon: redIcon }).bindPopup('Your location');
      const endMarker = L.marker([end.lat, end.lng], { icon: greenIcon }).bindPopup('Destination');
      startMarker.addTo(map);
      endMarker.addTo(map);
      markersRef.current = [startMarker, endMarker];

      // Create routing control – collapsible panel (minimise / expand)
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng),
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: '#2D6A4F', weight: 5 }] },
        collapsible: true,   // 👈 adds toggle button to collapse/expand the directions list
        show: true,
      }).addTo(map);

      controlRef.current = routingControl;
      if (onRouteReady) onRouteReady();
    };

    if (map._loaded) {
      initRouting();
    } else {
      map.whenReady(initRouting);
    }
  }, [map, start, end, onRouteReady]);

  return null;
}