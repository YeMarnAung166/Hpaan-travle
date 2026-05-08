import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths (Leaflet’s default icons use images that may not load)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Attractions in Hpa‑An
const attractions = [
  { id: 1, name: 'Saddan Cave', lat: 16.881, lng: 97.673, description: 'Large cave with hidden pagoda.' },
  { id: 2, name: 'Mount Zwegabin', lat: 16.868, lng: 97.700, description: 'Famous mountain with panoramic views.' },
  { id: 3, name: 'Kyauk Ka Lat Pagoda', lat: 16.889, lng: 97.627, description: 'Pagoda on limestone pillar in a lake.' },
  { id: 4, name: 'Kawgun Cave', lat: 16.836, lng: 97.643, description: 'Cave with thousands of Buddha images.' },
  { id: 5, name: 'Kan Thar Yar Lake', lat: 16.869, lng: 97.651, description: 'Peaceful lake, popular for sunset.' },
];

export default function MapPage() {
  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%' }} className="relative z-0">
      <MapContainer
        center={[16.89, 97.65]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {attractions.map((attraction) => (
          <Marker key={attraction.id} position={[attraction.lat, attraction.lng]}>
            <Popup>
              <strong>{attraction.name}</strong>
              <br />
              {attraction.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}