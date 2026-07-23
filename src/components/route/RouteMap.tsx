import { useEffect, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLng, RouteStop, WarehouseRecord } from '@/types/route'
import { currentLocationIcon, ensurePulseKeyframes, stopIcon, warehouseIcon } from '@/components/route/mapIcons'
import { v } from '@/theme/cssVars'

interface RouteMapProps {
  warehouse?: WarehouseRecord
  stops: RouteStop[]
  polyline?: [number, number][]
  currentLocation?: LatLng
  highlightStopId?: string
  onStopClick?: (stop: RouteStop) => void
  height?: number | string
  fitKey?: string | number
}

function FitBounds({ points, fitKey }: { points: LatLng[]; fitKey?: string | number }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14)
      return
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, points.length])
  return null
}

export function RouteMap({ warehouse, stops, polyline, currentLocation, highlightStopId, onStopClick, height = 420, fitKey }: RouteMapProps) {
  useEffect(() => ensurePulseKeyframes(), [])

  const allPoints = useMemo<LatLng[]>(() => {
    const pts: LatLng[] = []
    if (warehouse) pts.push(warehouse)
    stops.forEach((s) => pts.push({ lat: s.lat, lng: s.lng }))
    if (currentLocation) pts.push(currentLocation)
    return pts
  }, [warehouse, stops, currentLocation])

  const center: [number, number] = allPoints.length > 0 ? [allPoints[0].lat, allPoints[0].lng] : [11.2588, 75.7804]

  if (stops.length === 0 && !warehouse) {
    return (
      <Box
        sx={{
          height,
          borderRadius: '16px',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">Set start and end locations to preview the route on the map</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${v.border}`, position: 'relative' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} fitKey={fitKey} />

        {polyline && polyline.length > 1 && (
          <Polyline positions={polyline} pathOptions={{ color: '#2D6A4F', weight: 4, opacity: 0.85 }} />
        )}

        {warehouse && (
          <Marker position={[warehouse.lat, warehouse.lng]} icon={warehouseIcon()}>
            <Popup>
              <strong>{warehouse.name}</strong>
              <br />
              {warehouse.address}
            </Popup>
          </Marker>
        )}

        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(stop.sequence, stop.status, stop.id === highlightStopId)}
            eventHandlers={onStopClick ? { click: () => onStopClick(stop) } : undefined}
          >
            <Popup>
              <strong>#{stop.sequence} {stop.name}</strong>
              <br />
              {stop.address}
              <br />
              <span style={{ textTransform: 'capitalize' }}>{stop.status.replace('_', ' ')}</span>
            </Popup>
          </Marker>
        ))}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon()}>
            <Popup>Current location</Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  )
}
