// src/components/RouteControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const redIcon = L.divIcon({
  html: `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/><circle cx="11" cy="9" r="3.5" fill="white"/></svg>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

const blueIcon = L.divIcon({
  html: `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#2563EB" stroke="#1D4ED8" stroke-width="1"/><circle cx="11" cy="9" r="3.5" fill="white"/></svg>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

const waypointIcon = L.divIcon({
  html: `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#8B5CF6" stroke="#7C3AED" stroke-width="1"/><circle cx="11" cy="9" r="3.5" fill="white"/></svg>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

export default function RouteControl({ waypoints, onRouteReady }) {
  const map = useMap();
  const controlRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (controlRef.current) {
        if (controlRef.current._router && controlRef.current._router._pendingRequest) {
          controlRef.current._router._pendingRequest.abort();
        }
        controlRef.current._clearLines = function() {};
        if (map && map.removeControl) {
          try { map.removeControl(controlRef.current); } catch { /* already removed */ }
        }
        controlRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map || !waypoints || waypoints.length < 2) return;

    const initRouting = () => {
      if (!isMounted.current) return;

      if (controlRef.current) {
        if (controlRef.current._router && controlRef.current._router._pendingRequest) {
          controlRef.current._router._pendingRequest.abort();
        }
        controlRef.current._clearLines = function() {};
        try { map.removeControl(controlRef.current); } catch { /* already removed */ }
        controlRef.current = null;
      }

      const len = waypoints.length;
      const routingControl = L.Routing.control({
        waypoints: waypoints.map(w => L.latLng(w.lat, w.lng)),
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: '#2D6A4F', weight: 5 }] },
        collapsible: true,
        show: true,
        createMarker: function(i, waypoint) {
          const icon = i === 0 ? redIcon : i === len - 1 ? blueIcon : waypointIcon;
          return L.marker(waypoint.latLng, { icon, draggable: true });
        },
      }).addTo(map);

      controlRef.current = routingControl;
      if (onRouteReady) onRouteReady();
    };

    if (map._loaded) {
      initRouting();
    } else {
      map.whenReady(initRouting);
    }
  }, [map, waypoints, onRouteReady]);

  return null;
}