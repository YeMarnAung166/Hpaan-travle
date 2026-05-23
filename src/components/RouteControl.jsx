import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export default function RouteControl({ start, end, onRouteReady, onClose }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
    }
    controlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng),
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#2D6A4F', weight: 5 }] },
    }).addTo(map);
    if (onRouteReady) onRouteReady();
    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  }, [map, start, end, onRouteReady]);

  return null;
}