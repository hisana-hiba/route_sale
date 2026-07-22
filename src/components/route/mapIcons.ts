import L from 'leaflet'
import type { RouteStopStatus } from '@/types/route'

const STOP_COLORS: Record<RouteStopStatus, string> = {
  pending: '#3B82F6',
  in_progress: '#F59E0B',
  completed: '#10B981',
  skipped: '#EF4444',
}

/** Numbered circular pin used for delivery stops, coloured by status */
export function stopIcon(sequence: number, status: RouteStopStatus, highlighted = false): L.DivIcon {
  const color = STOP_COLORS[status]
  const size = highlighted ? 34 : 28
  const pulse = highlighted
    ? `<span style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:0.35;animation:rs-pulse 1.6s ease-out infinite;"></span>`
    : ''
  return L.divIcon({
    className: 'rs-stop-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="
          position:relative;width:${size}px;height:${size}px;border-radius:50%;
          background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:700;font-size:${highlighted ? 14 : 12}px;font-family:Inter,sans-serif;">
          ${sequence}
        </div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

/** Warehouse / depot marker */
export function warehouseIcon(): L.DivIcon {
  return L.divIcon({
    className: 'rs-warehouse-marker',
    html: `
      <div style="
        width:36px;height:36px;border-radius:10px;background:#1A2E25;border:2.5px solid #D4A745;
        box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4A745"><path d="M12 3 2 9v12h20V9L12 3zm0 2.3 7 4.2V19H5V9.5l7-4.2zM9 13h6v6H9v-6z"/></svg>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

/** Live current-location marker (driver's device / simulated position) */
export function currentLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'rs-current-marker',
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <span style="position:absolute;inset:-10px;border-radius:50%;background:#2563EB;opacity:0.25;animation:rs-pulse 1.4s ease-out infinite;"></span>
        <div style="position:relative;width:22px;height:22px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.6);"></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

let stylesInjected = false
export function ensurePulseKeyframes() {
  if (stylesInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.innerHTML = `
    @keyframes rs-pulse { 0% { transform: scale(0.6); opacity: 0.55; } 100% { transform: scale(1.6); opacity: 0; } }
    .leaflet-container { font-family: Inter, system-ui, sans-serif; }
  `
  document.head.appendChild(style)
  stylesInjected = true
}
