import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function RouteControls({ customRouteMode, routingActive, onToggleCustomRoute, onClearRouting, t }) {
  const map = useMap();
  const controlRef = useRef(null);
  const toggleRef = useRef(onToggleCustomRoute);
  const clearRef = useRef(onClearRouting);
  useEffect(() => {
    toggleRef.current = onToggleCustomRoute;
    clearRef.current = onClearRouting;
  });

  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.display = 'flex';
    container.style.gap = '4px';
    container.style.background = 'none';
    container.style.border = 'none';
    container.style.boxShadow = 'none';
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const routeBtn = L.DomUtil.create('button', '', container);
    routeBtn.type = 'button';
    routeBtn.style.width = '30px';
    routeBtn.style.height = '30px';
    routeBtn.style.display = 'flex';
    routeBtn.style.alignItems = 'center';
    routeBtn.style.justifyContent = 'center';
    routeBtn.style.border = 'none';
    routeBtn.style.borderRadius = '6px';
    routeBtn.style.cursor = 'pointer';
    routeBtn.style.background = customRouteMode ? '#2563EB' : 'white';
    routeBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.25)';
    routeBtn.title = customRouteMode ? t('map.tap_to_add_stops') : t('map.custom_route');
    routeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="${customRouteMode ? 'white' : '#4B5563'}" stroke-width="2">
        <circle cx="8" cy="8" r="2.5"/>
        <line x1="8" y1="1" x2="8" y2="4"/>
        <line x1="8" y1="12" x2="8" y2="15"/>
        <line x1="1" y1="8" x2="4" y2="8"/>
        <line x1="12" y1="8" x2="15" y2="8"/>
      </svg>`;
    routeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleRef.current();
    });

    const clearBtn = L.DomUtil.create('button', '', container);
    clearBtn.type = 'button';
    clearBtn.style.width = '30px';
    clearBtn.style.height = '30px';
    clearBtn.style.display = (routingActive || customRouteMode) ? 'flex' : 'none';
    clearBtn.style.alignItems = 'center';
    clearBtn.style.justifyContent = 'center';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '6px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.background = 'white';
    clearBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.25)';
    clearBtn.title = t('map.clear_route');
    clearBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round">
        <line x1="2" y1="2" x2="12" y2="12"/>
        <line x1="12" y1="2" x2="2" y2="12"/>
      </svg>`;
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearRef.current();
    });

    const CustomControl = L.Control.extend({
      onAdd: () => container,
    });
    const control = new CustomControl({ position: 'topleft' });
    control.addTo(map);

    controlRef.current = { container, routeBtn, clearBtn, control };

    return () => {
      control.remove();
      controlRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!controlRef.current) return;
    const { routeBtn, clearBtn } = controlRef.current;
    routeBtn.style.background = customRouteMode ? '#2563EB' : 'white';
    routeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="${customRouteMode ? 'white' : '#4B5563'}" stroke-width="2">
        <circle cx="8" cy="8" r="2.5"/>
        <line x1="8" y1="1" x2="8" y2="4"/>
        <line x1="8" y1="12" x2="8" y2="15"/>
        <line x1="1" y1="8" x2="4" y2="8"/>
        <line x1="12" y1="8" x2="15" y2="8"/>
      </svg>`;
    routeBtn.title = customRouteMode ? t('map.tap_to_add_stops') : t('map.custom_route');
    clearBtn.style.display = (routingActive || customRouteMode) ? 'flex' : 'none';
  }, [customRouteMode, routingActive, t]);

  return null;
}
