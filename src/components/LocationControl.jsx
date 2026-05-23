import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function LocationControl({ onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    // Custom control button (target icon)
    const CustomControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '36px';
        container.style.height = '36px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.cursor = 'pointer';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        container.title = 'Show my location';

        // SVG target icon
        container.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" stroke="#2D6A4F" stroke-width="2" fill="white"/>
            <circle cx="12" cy="12" r="3" fill="#2D6A4F"/>
            <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="#2D6A4F" stroke-width="2"/>
          </svg>
        `;

        container.onclick = () => {
          if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
          }

          // Show loading state
          container.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#2D6A4F" stroke-width="2" stroke-dasharray="4 4" fill="white">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          `;

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.flyTo([latitude, longitude], 15);

              // Remove old user marker
              if (window.userMarker) {
                map.removeLayer(window.userMarker);
              }

              // Red teardrop marker (similar to default Leaflet marker)
              const redMarkerIcon = L.divIcon({
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
                className: 'red-marker'
              });

              window.userMarker = L.marker([latitude, longitude], { icon: redMarkerIcon })
                .addTo(map)
                .bindPopup('You are here')
                .openPopup();

              window.userLocation = { lat: latitude, lng: longitude };
              if (onLocationFound) onLocationFound(window.userLocation);

              // Restore control icon
              container.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="#2D6A4F" stroke-width="2" fill="white"/>
                  <circle cx="12" cy="12" r="3" fill="#2D6A4F"/>
                  <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="#2D6A4F" stroke-width="2"/>
                </svg>
              `;
            },
            (error) => {
              container.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="#D32F2F" stroke-width="2" fill="white"/>
                  <path d="M12 5V13M12 16V17" stroke="#D32F2F" stroke-width="2"/>
                </svg>
              `;
              setTimeout(() => {
                container.innerHTML = `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" stroke="#2D6A4F" stroke-width="2" fill="white"/>
                    <circle cx="12" cy="12" r="3" fill="#2D6A4F"/>
                    <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="#2D6A4F" stroke-width="2"/>
                  </svg>
                `;
              }, 2000);

              let errorMsg = 'Unable to get your location. ';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg += 'Please allow location access.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg += 'Location information is unavailable.';
                  break;
                case error.TIMEOUT:
                  errorMsg += 'The request to get your location timed out.';
                  break;
                default:
                  errorMsg += error.message;
              }
              alert(errorMsg);
            }
          );
        };
        return container;
      },
    });

    const control = new CustomControl({ position: 'topleft' });
    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, onLocationFound]);

  return null;
}