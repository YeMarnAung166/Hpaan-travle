// src/pages/MapPage.jsx
// Suppress Leaflet's deprecated mouse event warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('mozPressure') || args[0].includes('mozInputSource'))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

import { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import LocationControl from '../components/LocationControl';
import RouteControl from '../components/RouteControl';
import { supabase } from '../supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const businessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const attractionIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/>
      <circle cx="16" cy="13" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'custom-marker',
});

function GeocoderControl({ onPlaceSelected }) {
  const map = useMap();
  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Search for a place...',
    }).on('markgeocode', (e) => {
      const center = e.geocode.center;
      map.flyTo(center, 15);
      if (onPlaceSelected) onPlaceSelected(center);
    }).addTo(map);
    return () => geocoder.remove();
  }, [map, onPlaceSelected]);
  return null;
}

export default function MapPage() {
  const [attractions, setAttractions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [routingActive, setRoutingActive] = useState(false);
  const [searchParams] = useSearchParams();
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [tripWaypoints, setTripWaypoints] = useState(null);
  const [tripRouteCoords, setTripRouteCoords] = useState([]);
  const [tripRouteLoading, setTripRouteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, name, name_my, description, description_my, lat, lng, category, image');
      if (bizData) setBusinesses(bizData.filter(b => b.lat && b.lng));
      setAttractions([
        { id: 1, name: 'Saddan Cave', lat: 16.881, lng: 97.673, description: 'Large cave with hidden pagoda.' },
        { id: 2, name: 'Mount Zwegabin', lat: 16.868, lng: 97.700, description: 'Famous mountain with panoramic views.' },
        { id: 3, name: 'Kyauk Ka Lat Pagoda', lat: 16.889, lng: 97.627, description: 'Pagoda on limestone pillar.' },
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    if (startParam && endParam) {
      const [startLat, startLng] = startParam.split(',').map(Number);
      const [endLat, endLng] = endParam.split(',').map(Number);
      setRouteStart({ lat: startLat, lng: startLng });
      setRouteEnd({ lat: endLat, lng: endLng });
      setRoutingActive(true);
      if (!userLocation) {
        setUserLocation({ lat: startLat, lng: startLng });
      }
    }
  }, [searchParams, userLocation]);

  useEffect(() => {
    const waypointsParam = searchParams.get('waypoints');
    if (waypointsParam) {
      try {
        const waypoints = JSON.parse(decodeURIComponent(waypointsParam));
        if (Array.isArray(waypoints) && waypoints.length >= 2) {
          setTripWaypoints(waypoints);
          setTripRouteLoading(true);
          const coordinates = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
          fetch(url)
            .then(res => res.json())
            .then(data => {
              if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                setTripRouteCoords(coords);
              } else {
                const coords = waypoints.map(p => [p.lat, p.lng]);
                setTripRouteCoords(coords);
              }
            })
            .catch(err => console.error('Route fetch error:', err))
            .finally(() => setTripRouteLoading(false));
        }
      } catch (e) {
        console.error('Failed to parse waypoints', e);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mapReady || !mapInstance) return;
    if (routingActive && routeStart) return;
    const locate = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          if (!routingActive) {
            mapInstance.flyTo([latitude, longitude], 13);
          }
        },
        (err) => console.warn('Geolocation error:', err)
      );
    };
    const timer = setTimeout(locate, 500);
    return () => clearTimeout(timer);
  }, [mapReady, mapInstance, routingActive, routeStart]);

  const startRouting = (endCoords) => {
    if (!userLocation) {
      alert('Please allow location access or click the location button first.');
      return;
    }
    setRouteStart(userLocation);
    setRouteEnd(endCoords);
    setRoutingActive(true);
  };

  const clearRouting = () => {
    console.log('Clearing route...'); // for debugging
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingActive(false);
    // Optionally, also clear any trip route (if you want)
    // setTripWaypoints(null);
    // setTripRouteCoords([]);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const allMarkers = [
    ...attractions.map(a => ({ ...a, type: 'attraction', icon: attractionIcon })),
    ...businesses.map(b => ({ ...b, type: 'business', icon: businessIcon }))
  ];

  return (
    <div className="relative h-[calc(100vh-70px)] w-full">
      <MapContainer
        center={[16.89, 97.65]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={(map) => {
          setMapInstance(map);
          if (map) setMapReady(true);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup chunkedLoading>
          {allMarkers.map((marker) => (
            <Marker
              key={`${marker.type}-${marker.id}`}
              position={[marker.lat, marker.lng]}
              icon={marker.icon}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={0.9} sticky>
                <strong>{marker.name}</strong>
              </Tooltip>
              <Popup>
                <div className="text-center min-w-[200px]">
                  <strong>{marker.name}</strong>
                  {marker.description && <p className="text-sm mt-1">{marker.description}</p>}
                  {marker.type === 'business' && (
                    <>
                      <Link to={`/business/${marker.id}`} className="inline-block mt-2 text-green-600 text-sm hover:underline">
                        View Details →
                      </Link>
                      <button
                        onClick={() => startRouting({ lat: marker.lat, lng: marker.lng })}
                        className="inline-block ml-2 text-blue-600 text-sm hover:underline"
                      >
                        Directions
                      </button>
                    </>
                  )}
                  {marker.type === 'attraction' && (
                    <button
                      onClick={() => startRouting({ lat: marker.lat, lng: marker.lng })}
                      className="inline-block mt-2 text-blue-600 text-sm hover:underline"
                    >
                      Get Directions
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {tripRouteCoords.length > 0 && !routingActive && (
          <Polyline positions={tripRouteCoords} color="#FF5733" weight={5} opacity={0.9} />
        )}
        {tripWaypoints && !tripRouteLoading && tripRouteCoords.length === 0 && (
          <Polyline
            positions={tripWaypoints.map(p => [p.lat, p.lng])}
            color="#FF5733"
            weight={5}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        {routingActive && routeStart && routeEnd && (
          <RouteControl start={routeStart} end={routeEnd} onRouteReady={() => {}} />
        )}

        <GeocoderControl />

        <LocationControl
          onLocationFound={(loc) => {
            setUserLocation(loc);
            if (!routingActive) {
              mapInstance?.flyTo([loc.lat, loc.lng], 15);
            }
          }}
        />

        {userLocation && !routingActive && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {userLocation && routingActive && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Your location (start)</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Clear Route button – placed outside MapContainer for visibility */}
      {routingActive && (
        <div className="absolute bottom-5 right-5 z-[1000]">
          <button
            onClick={clearRouting}
            className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-md hover:bg-gray-100 transition flex items-center gap-2"
          >
            <span className="text-red-500 text-lg">✕</span>
            <span className="text-sm font-medium">Clear Route</span>
          </button>
        </div>
      )}
    </div>
  );
}