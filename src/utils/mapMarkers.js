import L from 'leaflet';

export const destinationIcon = L.divIcon({
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

export const directoryIcon = L.divIcon({
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

export const userIcon = L.divIcon({
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

export const waypointIcon = L.divIcon({
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
