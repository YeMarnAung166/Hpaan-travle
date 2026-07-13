/* global L */
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
import RouteControls from '../components/RouteControls';
import { supabase } from '../supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../utils/imageHelpers';

const destinationIcon = L.divIcon({
  html: `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#2D6A4F" stroke="#1B4332" stroke-width="1"/>
      <circle cx="11" cy="9" r="3.5" fill="white"/>
    </svg>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

const directoryIcon = L.divIcon({
  html: `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#2563EB" stroke="#1D4ED8" stroke-width="1"/>
      <circle cx="11" cy="9" r="3.5" fill="white"/>
    </svg>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

const userIcon = L.divIcon({
  html: `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#E53935" stroke="#B71C1C" stroke-width="1"/>
      <circle cx="11" cy="9" r="3.5" fill="white"/>
    </svg>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
  className: 'custom-marker',
});

const waypointIcon = L.divIcon({
  html: `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 1C7 1 4 4.5 4 9C4 15 10 21 11 22C12 21 18 15 18 9C18 4.5 15 1 11 1Z" fill="#8B5CF6" stroke="#7C3AED" stroke-width="1"/>
      <circle cx="11" cy="9" r="3.5" fill="white"/>
    </svg>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
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

function MapClickHandler({ active, onAddWaypoint }) {
  const map = useMap();
  const activeRef = useRef(active);
  const addWpRef = useRef(onAddWaypoint);
  useEffect(() => {
    activeRef.current = active;
    addWpRef.current = onAddWaypoint;
  });
  useEffect(() => {
    const handler = (e) => {
      if (activeRef.current) addWpRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map]);
  return null;
}

export default function MapPage() {
  const { t, getLocalized } = useLanguage();
  const { toast } = useToast();
  const [attractions, setAttractions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [customRouteMode, setCustomRouteMode] = useState(false);
  const routingActive = routeWaypoints.length >= 2;
  const [searchParams] = useSearchParams();
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [tripWaypoints, setTripWaypoints] = useState(null);
  const [tripRouteCoords, setTripRouteCoords] = useState([]);
  const [tripRouteLoading, setTripRouteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('id, name, name_my, description, description_my, lat, lng, category, image');
        const { data: destData } = await supabase
          .from('destinations')
          .select('id, name, name_my, description, description_my, lat, lng, image');
        if (cancelled) return;
        if (bizData) setBusinesses(bizData.filter(b => b.lat && b.lng));
        if (destData) setAttractions(destData.filter(d => d.lat && d.lng));
      } catch (err) {
        console.error('Failed to fetch map data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    if (startParam && endParam) {
      const [startLat, startLng] = startParam.split(',').map(Number);
      const [endLat, endLng] = endParam.split(',').map(Number);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRouteWaypoints([{ lat: startLat, lng: startLng }, { lat: endLat, lng: endLng }]);
    }
  }, [searchParams]);

  useEffect(() => {
    const waypointsParam = searchParams.get('waypoints');
    if (!waypointsParam) return;

    const abortController = new AbortController();
    try {
      const waypoints = JSON.parse(decodeURIComponent(waypointsParam));
      if (Array.isArray(waypoints) && waypoints.length >= 2) {
        setTripWaypoints(waypoints);
        setTripRouteLoading(true);
        const coordinates = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
        fetch(url, { signal: abortController.signal })
          .then(res => { if (!res.ok) throw new Error('Route fetch failed'); return res.json(); })
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
              setTripRouteCoords(coords);
            } else {
              setTripRouteCoords(waypoints.map(p => [p.lat, p.lng]));
            }
          })
          .catch(err => {
            if (err.name === 'AbortError') return;
            console.error('Route fetch error:', err);
          })
          .finally(() => setTripRouteLoading(false));
      }
    } catch (e) {
      console.error('Failed to parse waypoints', e);
    }

    return () => abortController.abort();
  }, [searchParams]);

  useEffect(() => {
    if (!mapReady || !mapInstance) return;
    if (routingActive || customRouteMode) return;
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
  }, [mapReady, mapInstance, routingActive, customRouteMode, routeWaypoints]);

  const startRouting = (endCoords) => {
    if (!userLocation) {
      toast({ type: 'warning', message: 'Please allow location access or click the location button first.' });
      return;
    }
    setRouteWaypoints([userLocation, endCoords]);
    setCustomRouteMode(false);
  };

  const addWaypoint = (coords) => {
    setRouteWaypoints(prev => [...prev, coords]);
  };

  const undoLWaypoint = () => {
    setRouteWaypoints(prev => prev.slice(0, -1));
  };

  const toggleCustomRoute = () => {
    setCustomRouteMode(prev => !prev);
  };

  const clearRouting = () => {
    setRouteWaypoints([]);
    setCustomRouteMode(false);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="relative h-[calc(100vh-70px)] w-full">
      <Helmet>
        <title>Map of Hpa-An | Hpa-An Travel</title>
        <meta name="description" content="Interactive map of Hpa-An with destinations, businesses, and route planning." />
        <meta property="og:title" content="Map of Hpa-An" />
        <meta property="og:description" content="Interactive map of Hpa-An with destinations, businesses, and route planning." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className={`absolute inset-0 z-10 flex items-center justify-center bg-neutral-light dark:bg-neutral-dark ${mapReady ? 'hidden' : ''}`}>
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-text-soft text-sm">Loading map tiles...</p>
        </div>
      </div>
      <MapContainer
        center={[16.89, 97.65]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0 map-fade-in"
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

          <LayersControl.Overlay name={t('map.destinations')} checked>
            <MarkerClusterGroup chunkedLoading>
              {attractions.map((marker) => (
                <Marker
                  key={`attraction-${marker.id}`}
                  position={[marker.lat, marker.lng]}
                  icon={destinationIcon}
                >
                  <Tooltip direction="top" offset={[0, -5]} opacity={0.95} sticky>
                    <span className="font-semibold text-xs whitespace-nowrap">{getLocalized(marker, 'name')}</span>
                  </Tooltip>
                  <Popup>
                    <div className="text-center min-w-[200px]">
                      {marker.image && (
                        <img
                          src={getOptimizedImage(marker.image, 400)}
                          alt={getLocalized(marker, 'name')}
                          className="w-full h-28 object-cover rounded mb-1"
                          loading="lazy"
                        />
                      )}
                      <strong>{getLocalized(marker, 'name')}</strong>
                      {getLocalized(marker, 'description') && <p className="text-sm mt-1">{getLocalized(marker, 'description')}</p>}
                      {userLocation && (
                        <p className="text-xs text-text-soft mt-1">
                          {getDistance(userLocation.lat, userLocation.lng, marker.lat, marker.lng).toFixed(1)} {t('map.km_away')}
                        </p>
                      )}
                      <button
                        onClick={() => startRouting({ lat: marker.lat, lng: marker.lng })}
                        className="inline-block mt-2 text-blue-600 text-sm hover:underline"
                      >
                        Get Directions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name={t('map.directory')} checked>
            <MarkerClusterGroup chunkedLoading>
              {businesses.map((marker) => (
                <Marker
                  key={`business-${marker.id}`}
                  position={[marker.lat, marker.lng]}
                  icon={directoryIcon}
                >
                  <Tooltip direction="top" offset={[0, -5]} opacity={0.95} sticky>
                    <span className="font-semibold text-xs whitespace-nowrap">{getLocalized(marker, 'name')}</span>
                  </Tooltip>
                  <Popup>
                    <div className="text-center min-w-[200px]">
                      {marker.image && (
                        <img
                          src={getOptimizedImage(marker.image, 400)}
                          alt={getLocalized(marker, 'name')}
                          className="w-full h-28 object-cover rounded mb-1"
                          loading="lazy"
                        />
                      )}
                      <strong>{getLocalized(marker, 'name')}</strong>
                      {getLocalized(marker, 'description') && <p className="text-sm mt-1">{getLocalized(marker, 'description')}</p>}
                      {userLocation && (
                        <p className="text-xs text-text-soft mt-1">
                          {getDistance(userLocation.lat, userLocation.lng, marker.lat, marker.lng).toFixed(1)} {t('map.km_away')}
                        </p>
                      )}
                      <Link to={`/business/${marker.id}`} className="inline-block mt-2 text-green-600 text-sm hover:underline">
                        View Details →
                      </Link>
                      <button
                        onClick={() => startRouting({ lat: marker.lat, lng: marker.lng })}
                        className="inline-block ml-2 text-blue-600 text-sm hover:underline"
                      >
                        Directions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayersControl.Overlay>
        </LayersControl>

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

        {/* ===== MAP CLICK HANDLER (custom route) ===== */}
        <MapClickHandler active={customRouteMode} onAddWaypoint={addWaypoint} />

        {/* ===== CUSTOM ROUTE WAYPOINT MARKERS ===== */}
        {customRouteMode && !routingActive && routeWaypoints.map((wp, i) => (
          <Marker key={`wp-${i}`} position={[wp.lat, wp.lng]} icon={waypointIcon}>
            <Popup>Stop {i + 1}</Popup>
          </Marker>
        ))}

        {customRouteMode && routeWaypoints.length >= 2 && !routingActive && (
          <Polyline
            positions={routeWaypoints.map(wp => [wp.lat, wp.lng])}
            color="#8B5CF6"
            weight={3}
            opacity={0.5}
            dashArray="8, 6"
          />
        )}

        {/* ===== DIRECTION ROUTE ===== */}
        {routingActive && routeWaypoints.length >= 2 && (
          <RouteControl waypoints={routeWaypoints} onRouteReady={() => {}} />
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

        {/* ===== ROUTE CONTROLS ===== */}
        <RouteControls
          customRouteMode={customRouteMode}
          routingActive={routingActive}
          waypointCount={routeWaypoints.length}
          onToggleCustomRoute={toggleCustomRoute}
          onClearRouting={clearRouting}
          onUndoWaypoint={undoLWaypoint}
          t={t}
        />

        {/* ===== USER LOCATION MARKER ===== */}
        {userLocation && !routingActive && !customRouteMode && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>{t('map.you_are_here')}</Popup>
          </Marker>
                )}
      </MapContainer>
    </div>
  );
}

