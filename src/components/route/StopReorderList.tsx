import { Box, IconButton, Paper, Typography } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { RouteStop } from '@/types/route'
import { formatDistance } from '@/utils/geo'
import { v } from '@/theme/cssVars'

const STOP_COLORS: Record<string, string> = {
  pending: '#3B82F6',
  in_progress: '#F59E0B',
  completed: '#10B981',
  skipped: '#EF4444',
}

interface SortableStopRowProps {
  stop: RouteStop
  onRemove?: (id: string) => void
  onSelect?: (stop: RouteStop) => void
  selected?: boolean
}

function SortableStopRow({ stop, onRemove, onSelect, selected }: SortableStopRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(stop)}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: 1.25,
        mb: 1,
        borderRadius: '14px',
        border: `1px solid ${selected ? v.primary : v.border}`,
        bgcolor: selected ? 'color-mix(in srgb, var(--rs-primary) 6%, var(--rs-surface))' : v.surface,
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <Box {...attributes} {...listeners} sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', color: v.textMuted, touchAction: 'none' }}>
        <DragIndicatorIcon fontSize="small" />
      </Box>

      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          bgcolor: STOP_COLORS[stop.status] ?? '#3B82F6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {stop.sequence}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
          {stop.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: v.textMuted }}>
          <LocationOnIcon sx={{ fontSize: 13 }} />
          <Typography variant="caption" noWrap>{stop.address}</Typography>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: v.textSecondary, fontWeight: 600, flexShrink: 0 }}>
        {formatDistance(stop.legDistanceKm)}
      </Typography>

      {onRemove && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(stop.id)
          }}
          sx={{ color: v.error }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  )
}

interface StopReorderListProps {
  stops: RouteStop[]
  onReorder: (newOrder: RouteStop[]) => void
  onRemove?: (id: string) => void
  onSelect?: (stop: RouteStop) => void
  selectedId?: string
}

export function StopReorderList({ stops, onReorder, onRemove, onSelect, selectedId }: StopReorderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = stops.findIndex((s) => s.id === active.id)
    const newIndex = stops.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(stops, oldIndex, newIndex))
  }

  if (stops.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', borderRadius: '14px', bgcolor: 'action.hover' }}>
        <Typography variant="body2" color="text.secondary">No stops added yet</Typography>
      </Box>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <Box>
          {stops.map((stop) => (
            <SortableStopRow key={stop.id} stop={stop} onRemove={onRemove} onSelect={onSelect} selected={stop.id === selectedId} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  )
}
