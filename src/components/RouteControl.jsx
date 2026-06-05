import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Only the green destination marker (start marker removed to avoid duplication)
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
  const endMarkerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Remove routing control
      if (controlRef.current && map && map.removeControl) {
        try { map.removeControl(controlRef.current); } catch (e) {}
        controlRef.current = null;
      }
      // Remove end marker
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map || !start || !end) return;

    const initRouting = () => {
      if (!isMounted.current) return;

      // Clean up previous control and end marker
      if (controlRef.current) {
        try { map.removeControl(controlRef.current); } catch (e) {}
        controlRef.current = null;
      }
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }

      // Add only the destination (end) marker – green
      const endMarker = L.marker([end.lat, end.lng], { icon: greenIcon }).bindPopup('Destination');
      endMarker.addTo(map);
      endMarkerRef.current = endMarker;

      // Create routing control (adds the turn‑by‑turn panel and the route line)
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng),
        ],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: '#2D6A4F', weight: 5 }] },
        addWaypoints: false,          // no extra waypoint markers
        createMarker: () => null,     // suppresses default start/end markers
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