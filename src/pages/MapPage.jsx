import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
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

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
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

// Red teardrop icon for user location (same as LocationControl)
const userIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 2 C10 2 5 7 5 13 C5 21 15 29 16 30 C17 29 27 21 27 13 C27 7 22 2 16 2 Z" fill="#E53935" filter="url(#shadow)"/>
      <circle cx="16" cy="13" r="4" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -20],
  className: 'user-location-marker',
});

// Component for search box
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

  // Automatically get user location when map loads
  useEffect(() => {
    if (!mapInstance) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          mapInstance.flyTo([latitude, longitude], 13);
          // Add marker manually (will be rendered via state)
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Silently fail, no marker
        }
      );
    }
  }, [mapInstance]);

  // Parse URL params for directions
  useEffect(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    if (startParam && endParam) {
      const [startLat, startLng] = startParam.split(',').map(Number);
      const [endLat, endLng] = endParam.split(',').map(Number);
      setRouteStart({ lat: startLat, lng: startLng });
      setRouteEnd({ lat: endLat, lng: endLng });
      setRoutingActive(true);
    }
  }, [searchParams]);

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
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingActive(false);
  };

  if (loading) return <div className="spinner mx-auto my-12"></div>;

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
        ref={setMapInstance}
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

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {routingActive && routeStart && routeEnd && (
          <RouteControl start={routeStart} end={routeEnd} onClose={clearRouting} />
        )}

        <GeocoderControl />
        <LocationControl onLocationFound={(loc) => {
          setUserLocation(loc);
          mapInstance?.flyTo([loc.lat, loc.lng], 15);
        }} />

        {routingActive && (
          <div className="leaflet-control leaflet-bar" style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
            <button
              onClick={clearRouting}
              className="bg-white p-2 rounded shadow text-sm font-medium hover:bg-gray-100"
              style={{ width: '100px' }}
            >
              Clear Route
            </button>
          </div>
        )}
      </MapContainer>
    </div>
  );
}