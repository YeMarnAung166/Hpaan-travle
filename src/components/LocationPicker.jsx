import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat.toFixed(6), lng.toFixed(6));
    },
  });
  return null;
}

function MapFlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([parseFloat(lat), parseFloat(lng)], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onLocationChange, label = 'Location' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (lat && lng && !searchQuery) {
      setSearchQuery(`${lat}, ${lng}`);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleMapClick = (newLat, newLng) => {
    setSearchResults([]);
    onLocationChange(newLat, newLng);
  };

  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'User-Agent': 'HpaAnTravel/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Geocoding failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const selectResult = (result) => {
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onLocationChange(parseFloat(result.lat).toFixed(6), parseFloat(result.lon).toFixed(6));
  };

  const handleLatChange = (e) => {
    onLocationChange(e.target.value, lng);
  };

  const handleLngChange = (e) => {
    onLocationChange(lat, e.target.value);
  };

  const centerLat = lat ? parseFloat(lat) : 16.89;
  const centerLng = lng ? parseFloat(lng) : 97.65;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold mb-1">{label}</h3>

      <div className="relative">
        <input
          type="text"
          placeholder="Search for a place or address..."
          value={searchQuery}
          onChange={handleSearchInput}
          className="w-full border border-border dark:border-border rounded px-3 py-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
        />
        {searching && (
          <span className="absolute right-3 top-2.5 text-sm text-text-soft">Searching...</span>
        )}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-neutral-dark border border-border rounded-b-lg shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-light dark:hover:bg-neutral-mid text-text truncate border-b border-border last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-48 rounded-lg overflow-hidden border border-border z-0">
        <MapContainer
          key={`${centerLat}-${centerLng}`}
          center={[centerLat, centerLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <MapFlyTo lat={lat} lng={lng} />
          {lat && lng && (
            <Marker position={[parseFloat(lat), parseFloat(lng)]} />
          )}
        </MapContainer>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          name="lat"
          placeholder="Latitude"
          value={lat || ''}
          onChange={handleLatChange}
          className="w-full border border-border dark:border-border rounded px-3 py-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
        />
        <input
          type="text"
          name="lng"
          placeholder="Longitude"
          value={lng || ''}
          onChange={handleLngChange}
          className="w-full border border-border dark:border-border rounded px-3 py-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
        />
      </div>
    </div>
  );
}
