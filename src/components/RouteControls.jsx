import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const btnBase = {
  width: '30px', height: '30px', display: 'flex', alignItems: 'center',
  justifyContent: 'center', border: 'none', borderRadius: '6px',
  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
};

function routeIcon(active) {
  const stroke = active ? 'white' : '#4B5563';
  return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="2">
    <circle cx="8" cy="8" r="2.5"/><line x1="8" y1="1" x2="8" y2="4"/>
    <line x1="8" y1="12" x2="8" y2="15"/><line x1="1" y1="8" x2="4" y2="8"/>
    <line x1="12" y1="8" x2="15" y2="8"/></svg>`;
}

function undoIcon() {
  return `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 13.08a7 7 0 101.42-10.66"/></svg>`;
}

function clearIcon() {
  return `<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round">
    <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>`;
}

export default function RouteControls({ customRouteMode, routingActive, waypointCount, onToggleCustomRoute, onClearRouting, onUndoWaypoint, t }) {
  const map = useMap();
  const controlRef = useRef(null);
  const toggleRef = useRef(onToggleCustomRoute);
  const clearRef = useRef(onClearRouting);
  const undoLRef = useRef(onUndoWaypoint);
  useEffect(() => {
    toggleRef.current = onToggleCustomRoute;
    clearRef.current = onClearRouting;
    undoLRef.current = onUndoWaypoint;
  });

  const updateButtons = useCallback(() => {
    if (!controlRef.current) return;
    const { routeBtn, clearBtn, undoBtn } = controlRef.current;
    const active = !!customRouteMode;
    routeBtn.style.background = active ? '#2563EB' : 'white';
    routeBtn.innerHTML = routeIcon(active);
    routeBtn.title = active ? t('map.tap_to_add_stops') : t('map.custom_route');
    clearBtn.style.display = (routingActive || active) ? 'flex' : 'none';
    undoBtn.style.display = (active && waypointCount > 0) ? 'flex' : 'none';
  }, [customRouteMode, routingActive, waypointCount, t]);

  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.cssText = 'display:flex;gap:4px;background:none;border:none;box-shadow:none';
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const routeBtn = L.DomUtil.create('button', '', container);
    Object.assign(routeBtn.style, btnBase, { background: 'white' });
    routeBtn.type = 'button';
    routeBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleRef.current(); });

    const undoBtn = L.DomUtil.create('button', '', container);
    Object.assign(undoBtn.style, btnBase, { background: 'white', display: 'none' });
    undoBtn.type = 'button';
    undoBtn.title = t('map.undo_waypoint') || 'Undo last stop';
    undoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
    undoBtn.addEventListener('click', (e) => { e.stopPropagation(); undoLRef.current(); });

    const clearBtn = L.DomUtil.create('button', '', container);
    Object.assign(clearBtn.style, btnBase, { background: 'white', display: 'none' });
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', (e) => { e.stopPropagation(); clearRef.current(); });

    const CustomControl = L.Control.extend({ onAdd: () => container });
    const control = new CustomControl({ position: 'topleft' });
    control.addTo(map);

    controlRef.current = { container, routeBtn, clearBtn, undoBtn, control };
    updateButtons();

    return () => {
      control.remove();
      controlRef.current = null;
    };
  }, [map]);

  useEffect(() => { updateButtons(); }, [updateButtons]);

  return null;
}
