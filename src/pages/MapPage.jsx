import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons (Leaflet bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const attractions = [
  { id: 1, name: 'Saddan Cave', lat: 16.881, lng: 97.673, description: 'Large cave with a hidden pagoda inside.' },
  { id: 2, name: 'Mount Zwegabin', lat: 16.868, lng: 97.700, description: 'Famous mountain with panoramic views.' },
  { id: 3, name: 'Kyauk Ka Lat Pagoda', lat: 16.889, lng: 97.627, description: 'Pagoda on a limestone pillar in a lake.' },
  { id: 4, name: 'Kawgun Cave', lat: 16.836, lng: 97.643, description: 'Cave with thousands of Buddha images.' },
  { id: 5, name: 'Kan Thar Yar Lake', lat: 16.869, lng: 97.651, description: 'Peaceful lake, popular for sunset views.' },
];

export default function MapPage() {
  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[16.89, 97.65]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
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