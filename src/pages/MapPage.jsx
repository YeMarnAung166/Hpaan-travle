import { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  LayersControl,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import LocationControl from '../components/LocationControl';
import RouteControl from '../components/RouteControl';
import { supabase } from '../supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Helmet } from 'react-helmet-async';

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

// Helper function to calculate distance in km using Haversine formula
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocoder component
function GeocoderControl({ onPlaceSelected }) {
  const map = useMap();
  const { t } = useLanguage();
  useEffect(() => {
    const placeholder = t('map.search_placeholder');
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder,
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
  const { t } = useLanguage();
  const { toast } = useToast();
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
      const { data: destData } = await supabase
        .from('destinations')
        .select('id, name, name_my, description, description_my, lat, lng, image');
      if (destData) setAttractions(destData.filter(d => d.lat && d.lng));
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
    }
  }, [searchParams]);

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
      toast({ type: 'warning', message: 'Please allow location access or click the location button first.' });
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

  if (loading) return <LoadingSpinner size="lg" />;

  const allMarkers = [
    ...attractions.map(a => ({ ...a, type: 'attraction', icon: attractionIcon })),
    ...businesses.map(b => ({ ...b, type: 'business', icon: businessIcon }))
  ];

  return (
    <div className="relative h-[calc(100vh-70px)] w-full">
      <Helmet>
        <title>Map of Hpa-An | Hpa-An Travel</title>
        <meta name="description" content="Interactive map of Hpa-An with destinations, businesses, and route planning." />
        <meta property="og:title" content="Map of Hpa-An" />
        <meta property="og:description" content="Interactive map of Hpa-An with destinations, businesses, and route planning." />
        <meta property="og:type" content="website" />
      </Helmet>
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-light dark:bg-neutral-dark">
          <div className="text-center">
            <div className="spinner mb-3"></div>
            <p className="text-text-soft text-sm">Loading map tiles...</p>
          </div>
        </div>
      )}
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
        {/* ===== LAYER TOGGLE ===== */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer name={t('map.street')} checked>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t('map.satellite')}>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={t('map.terrain')}>
            <TileLayer
              attribution='&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* ===== MARKERS WITH CLUSTERING AND DISTANCE ===== */}
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
                  {/* Distance from user */}
                  {userLocation && (
                    <p className="text-xs text-text-soft mt-1">
                      {getDistance(userLocation.lat, userLocation.lng, marker.lat, marker.lng).toFixed(1)} {t('map.km_away')}
                    </p>
                  )}
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

        {/* ===== TRIP ROUTE ===== */}
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

        {/* ===== DIRECTION ROUTE ===== */}
        {routingActive && routeStart && routeEnd && (
          <RouteControl start={routeStart} end={routeEnd} onRouteReady={() => {}} />
        )}

        {/* ===== GEOCODER ===== */}
        <GeocoderControl />

        {/* ===== LOCATION CONTROL ===== */}
        <LocationControl
          onLocationFound={(loc) => {
            setUserLocation(loc);
            if (!routingActive) {
              mapInstance?.flyTo([loc.lat, loc.lng], 15);
            }
          }}
        />

        {/* ===== USER LOCATION MARKER ===== */}
        {userLocation && !routingActive && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>{t('map.you_are_here')}</Popup>
          </Marker>
        )}
        {userLocation && routingActive && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>{t('map.your_location_start')}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ===== CLEAR ROUTE BUTTON ===== */}
      {routingActive && (
        <div className="absolute bottom-5 right-5 z-[1000]">
          <button
            onClick={clearRouting}
            className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-md hover:bg-gray-100 transition flex items-center gap-2"
          >
            <span className="text-red-500 text-lg">✕</span>
            <span className="text-sm font-medium">{t('map.clear_route')}</span>
          </button>
        </div>
      )}
    </div>
  );
}