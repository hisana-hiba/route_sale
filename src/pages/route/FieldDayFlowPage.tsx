import { useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import LoginIcon from '@mui/icons-material/Login'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PaymentsIcon from '@mui/icons-material/Payments'
import LogoutIcon from '@mui/icons-material/Logout'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import FlagIcon from '@mui/icons-material/Flag'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { PageShell, primaryButtonSx, whiteCardSx } from '@/components/ui/PageShell'
import { RoleGuard } from '@/routes/RoleGuard'
import { formatCurrency } from '@/utils/export'
import { CUSTOMERS } from './routeGeoData'
import { RouteWorkflowStrip, ROUTE_DAY_STEPS } from './RouteWorkflowStrip'
import { v, mix } from '@/theme/cssVars'
import { colors } from '@/theme/palette'

type FlowStep =
  | 'start'
  | 'gps'
  | 'market'
  | 'new-shop?'
  | 'add-customer'
  | 'gps-save'
  | 'photo'
  | 'save-customer'
  | 'visit-existing'
  | 'check-in'
  | 'order'
  | 'invoice'
  | 'payment'
  | 'check-out'
  | 'next'
  | 'end'
  | 'upload'
  | 'learned'
  | 'suggestions'

const STRIP_INDEX: Record<FlowStep, number> = {
  start: 0,
  gps: 1,
  market: 2,
  'new-shop?': 3,
  'add-customer': 3,
  'gps-save': 3,
  photo: 3,
  'save-customer': 3,
  'visit-existing': 3,
  'check-in': 4,
  order: 5,
  invoice: 6,
  payment: 7,
  'check-out': 8,
  next: 8,
  end: 9,
  upload: 10,
  learned: 11,
  suggestions: 12,
}

const MARKETS = ['Mananchira Market', 'Palayam Bazaar', 'Nadakkavu Circle', 'Feroke Hub']
const PRODUCTS = [
  { id: 'p1', name: 'Sunflower Oil 5L', price: 850 },
  { id: 'p2', name: 'Basmati Rice 25kg', price: 1850 },
  { id: 'p3', name: 'Toor Dal 1kg', price: 160 },
  { id: 'p4', name: 'Whole Wheat Atta 10kg', price: 420 },
]

interface VisitLog {
  customer: string
  orderTotal: number
  payment: number
  checkedOutAt: string
}

interface NewCustomerForm {
  shopName: string
  ownerName: string
  mobile: string
  address: string
  category: string
}

const emptyCustomer: NewCustomerForm = {
  shopName: '',
  ownerName: '',
  mobile: '',
  address: '',
  category: 'Retail',
}

export function FieldDayFlowPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'manager', 'salesman', 'deliveryAgent']}>
      <FieldDayFlowContent />
    </RoleGuard>
  )
}

function FieldDayFlowContent() {
  const [step, setStep] = useState<FlowStep>('start')
  const [gpsOn, setGpsOn] = useState(false)
  const [market, setMarket] = useState(MARKETS[0])
  const [isNewShop, setIsNewShop] = useState<'yes' | 'no'>('no')
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>(emptyCustomer)
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [gpsSaved, setGpsSaved] = useState(false)
  const [customerId, setCustomerId] = useState(CUSTOMERS[0]?.id ?? '')
  const [extraCustomers, setExtraCustomers] = useState<{ id: string; name: string; address: string; phone: string }[]>([])
  const [orderQty, setOrderQty] = useState<Record<string, number>>({ p1: 2, p2: 1, p3: 5, p4: 0 })
  const [payAmount, setPayAmount] = useState(0)
  const [payMode, setPayMode] = useState('Cash')
  const [visits, setVisits] = useState<VisitLog[]>([])
  const [msg, setMsg] = useState('')
  const [uploaded, setUploaded] = useState(false)

  const allCustomers = useMemo(
    () => [
      ...CUSTOMERS.map((c) => ({ id: c.id, name: c.name, address: c.address, phone: c.phone })),
      ...extraCustomers,
    ],
    [extraCustomers],
  )

  const selectedCustomer = allCustomers.find((c) => c.id === customerId) ?? allCustomers[0]

  const orderLines = PRODUCTS.filter((p) => (orderQty[p.id] ?? 0) > 0).map((p) => ({
    ...p,
    qty: orderQty[p.id] ?? 0,
    lineTotal: (orderQty[p.id] ?? 0) * p.price,
  }))
  const orderTotal = orderLines.reduce((s, l) => s + l.lineTotal, 0)
  const invoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(visits.length + 1).padStart(3, '0')}`

  const suggestions = useMemo(() => {
    const visited = new Set(visits.map((v) => v.customer))
    return CUSTOMERS.filter((c) => !visited.has(c.name)).slice(0, 4)
  }, [visits])

  const go = (next: FlowStep, notice?: string) => {
    setStep(next)
    if (notice) setMsg(notice)
  }

  const resetOrder = () => {
    setOrderQty({ p1: 2, p2: 1, p3: 5, p4: 0 })
    setPayAmount(0)
    setPayMode('Cash')
  }

  const handleCheckout = () => {
    if (!selectedCustomer) return
    setVisits((prev) => [
      ...prev,
      {
        customer: selectedCustomer.name,
        orderTotal,
        payment: payAmount,
        checkedOutAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    go('next', `Checked out from ${selectedCustomer.name}`)
  }

  const card = (icon: ReactNode, title: string, body: ReactNode, actions: ReactNode) => (
    <Paper sx={{ ...whiteCardSx, p: { xs: 2.5, md: 3.5 }, maxWidth: 720 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: mix.primary(12),
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            Step {STRIP_INDEX[step] + 1} of {ROUTE_DAY_STEPS.length} · Field day cycle
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mb: 2.5 }}>{body}</Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box>
    </Paper>
  )

  let panel: ReactNode = null

  switch (step) {
    case 'start':
      panel = card(
        <PlayArrowIcon />,
        'Start Day',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Begin your route day. GPS tracking and visit logging will stay on until you end the route.
          </Typography>
          <Chip label={`${CUSTOMERS.length} shops on typical route`} size="small" />
          <Chip label="Kozhikode territory" size="small" sx={{ ml: 0.75 }} />
        </>,
        <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />} sx={primaryButtonSx} onClick={() => go('gps')}>
          Start Day
        </Button>,
      )
      break

    case 'gps':
      panel = card(
        <GpsFixedIcon />,
        'GPS Tracking ON',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Enable live GPS so check-ins, new shop pins, and end-of-day upload stay accurate.
          </Typography>
          <Chip
            icon={<GpsFixedIcon sx={{ fontSize: 16 }} />}
            label={gpsOn ? 'GPS Active · 11.2588° N, 75.7804° E' : 'GPS Off'}
            color={gpsOn ? 'success' : 'default'}
            onClick={() => setGpsOn(true)}
          />
        </>,
        <Button
          variant="contained"
          color="primary"
          disabled={!gpsOn}
          sx={primaryButtonSx}
          onClick={() => go('market', 'GPS tracking enabled')}
        >
          Continue
        </Button>,
      )
      break

    case 'market':
      panel = card(
        <StorefrontIcon />,
        'Visit Market',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Select the market area you are covering now.
          </Typography>
          <TextField select fullWidth size="small" label="Market" value={market} onChange={(e) => setMarket(e.target.value)}>
            {MARKETS.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('new-shop?')}>
          Arrive at Market
        </Button>,
      )
      break

    case 'new-shop?':
      panel = card(
        <PersonAddIcon />,
        'New Shop?',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Is this a new outlet not yet on your route?
          </Typography>
          <RadioGroup row value={isNewShop} onChange={(e) => setIsNewShop(e.target.value as 'yes' | 'no')}>
            <FormControlLabel value="yes" control={<Radio />} label="Yes — add customer" />
            <FormControlLabel value="no" control={<Radio />} label="No — existing customer" />
          </RadioGroup>
        </>,
        <Button
          variant="contained"
          color="primary"
          sx={primaryButtonSx}
          onClick={() => {
            if (isNewShop === 'yes') {
              setNewCustomer(emptyCustomer)
              setPhotoCaptured(false)
              setGpsSaved(false)
              go('add-customer')
            } else {
              go('visit-existing')
            }
          }}
        >
          Continue
        </Button>,
      )
      break

    case 'add-customer':
      panel = card(
        <PersonAddIcon />,
        'Add Customer',
        <Grid container spacing={1.5}>
          {([
            ['shopName', 'Shop Name'],
            ['ownerName', 'Owner Name'],
            ['mobile', 'Mobile'],
            ['address', 'Address'],
          ] as const).map(([key, label]) => (
            <Grid key={key} size={{ xs: 12, sm: key === 'address' ? 12 : 6 }}>
              <TextField
                fullWidth
                size="small"
                label={label}
                required
                value={newCustomer[key]}
                onChange={(e) => setNewCustomer((f) => ({ ...f, [key]: e.target.value }))}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={newCustomer.category}
              onChange={(e) => setNewCustomer((f) => ({ ...f, category: e.target.value }))}
            >
              {['Retail', 'Grocery', 'Wholesale', 'Supermarket'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>,
        <Button
          variant="contained"
          color="primary"
          sx={primaryButtonSx}
          disabled={!newCustomer.shopName || !newCustomer.ownerName || !newCustomer.mobile}
          onClick={() => go('gps-save')}
        >
          Next — GPS Auto Save
        </Button>,
      )
      break

    case 'gps-save':
      panel = card(
        <MyLocationIcon />,
        'GPS Auto Save',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Capture the shop pin from your current location.
          </Typography>
          <Alert severity={gpsSaved ? 'success' : 'info'} sx={{ borderRadius: '10px' }}>
            {gpsSaved
              ? `Location saved for ${newCustomer.shopName || 'shop'} · 11.2588, 75.7804`
              : 'Waiting for GPS fix… tap Save Location.'}
          </Alert>
        </>,
        <>
          <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={() => setGpsSaved(true)} sx={{ borderRadius: '10px', textTransform: 'none' }}>
            Save Location
          </Button>
          <Button variant="contained" color="primary" disabled={!gpsSaved} sx={primaryButtonSx} onClick={() => go('photo')}>
            Next — Photo Capture
          </Button>
        </>,
      )
      break

    case 'photo':
      panel = card(
        <PhotoCameraIcon />,
        'Photo Capture',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Take a storefront photo for outlet verification.
          </Typography>
          <Box
            sx={{
              height: 140,
              borderRadius: '12px',
              border: `1px dashed ${v.border}`,
              bgcolor: mix.primary(4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {photoCaptured ? (
              <>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Storefront photo captured</Typography>
              </>
            ) : (
              <>
                <PhotoCameraIcon sx={{ color: v.textMuted }} />
                <Typography variant="caption" color="text.secondary">No photo yet</Typography>
              </>
            )}
          </Box>
        </>,
        <>
          <Button variant="outlined" startIcon={<PhotoCameraIcon />} onClick={() => setPhotoCaptured(true)} sx={{ borderRadius: '10px', textTransform: 'none' }}>
            Capture Photo
          </Button>
          <Button variant="contained" color="primary" disabled={!photoCaptured} sx={primaryButtonSx} onClick={() => go('save-customer')}>
            Next — Save Customer
          </Button>
        </>,
      )
      break

    case 'save-customer': {
      const canSave = Boolean(newCustomer.shopName && gpsSaved && photoCaptured)
      panel = card(
        <CheckCircleIcon />,
        'Save Customer',
        <Typography variant="body2" color="text.secondary">
          Confirm and save <strong>{newCustomer.shopName}</strong> to your customer list, then continue the visit.
        </Typography>,
        <Button
          variant="contained"
          color="primary"
          disabled={!canSave}
          sx={primaryButtonSx}
          onClick={() => {
            const id = `new-${Date.now()}`
            setExtraCustomers((prev) => [
              ...prev,
              {
                id,
                name: newCustomer.shopName,
                address: newCustomer.address || market,
                phone: newCustomer.mobile,
              },
            ])
            setCustomerId(id)
            go('visit-existing', `${newCustomer.shopName} saved`)
          }}
        >
          Save Customer
        </Button>,
      )
      break
    }

    case 'visit-existing':
      panel = card(
        <StorefrontIcon />,
        'Visit Existing Customer',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Choose the outlet you are visiting in {market}.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {allCustomers.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          {selectedCustomer && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {selectedCustomer.address} · {selectedCustomer.phone}
            </Typography>
          )}
        </>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('check-in')}>
          Go to Check-In
        </Button>,
      )
      break

    case 'check-in':
      panel = card(
        <LoginIcon />,
        'Check-In (GPS)',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Check in at <strong>{selectedCustomer?.name}</strong> with your live GPS pin.
          </Typography>
          <Alert severity="info" icon={<GpsFixedIcon />} sx={{ borderRadius: '10px' }}>
            Within geofence · 11.2588° N, 75.7804° E
          </Alert>
        </>,
        <Button variant="contained" color="primary" startIcon={<LoginIcon />} sx={primaryButtonSx} onClick={() => { resetOrder(); go('order', `Checked in at ${selectedCustomer?.name}`) }}>
          Check In
        </Button>,
      )
      break

    case 'order':
      panel = card(
        <ShoppingCartIcon />,
        'Create Order',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Build the order for {selectedCustomer?.name}.
          </Typography>
          {PRODUCTS.map((p) => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: `1px solid ${v.border}` }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatCurrency(p.price)}</Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                value={orderQty[p.id] ?? 0}
                onChange={(e) => setOrderQty((q) => ({ ...q, [p.id]: Math.max(0, Number(e.target.value) || 0) }))}
                sx={{ width: 88 }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Box>
          ))}
          <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 800 }}>
            Order total: {formatCurrency(orderTotal)}
          </Typography>
        </>,
        <Button variant="contained" color="primary" disabled={orderTotal <= 0} sx={primaryButtonSx} onClick={() => { setPayAmount(orderTotal); go('invoice') }}>
          Create Order
        </Button>,
      )
      break

    case 'invoice':
      panel = card(
        <ReceiptIcon />,
        'Invoice',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Invoice generated for this visit.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: mix.primary(4) }}>
            <Typography variant="caption" color="text.secondary">{invoiceNo}</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{selectedCustomer?.name}</Typography>
            {orderLines.map((l) => (
              <Box key={l.id} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2">{l.name} × {l.qty}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(l.lineTotal)}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1, borderTop: `1px solid ${v.border}` }}>
              <Typography sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography sx={{ fontWeight: 800 }}>{formatCurrency(orderTotal)}</Typography>
            </Box>
          </Paper>
        </>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('payment')}>
          Proceed to Payment
        </Button>,
      )
      break

    case 'payment':
      panel = card(
        <PaymentsIcon />,
        'Payment Collection',
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Amount collected"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value) || 0)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth size="small" label="Mode" value={payMode} onChange={(e) => setPayMode(e.target.value)}>
              {['Cash', 'UPI', 'Cheque', 'Credit'].map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" color="text.secondary">
              Invoice due {formatCurrency(orderTotal)} · Balance {formatCurrency(Math.max(0, orderTotal - payAmount))}
            </Typography>
          </Grid>
        </Grid>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('check-out', `Collected ${formatCurrency(payAmount)} via ${payMode}`)}>
          Record Payment
        </Button>,
      )
      break

    case 'check-out':
      panel = card(
        <LogoutIcon />,
        'Check-Out',
        <Typography variant="body2" color="text.secondary">
          Finish the visit at <strong>{selectedCustomer?.name}</strong>. GPS check-out time will be logged with order and payment.
        </Typography>,
        <Button variant="contained" color="primary" startIcon={<LogoutIcon />} sx={primaryButtonSx} onClick={handleCheckout}>
          Check Out
        </Button>,
      )
      break

    case 'next':
      panel = card(
        <NavigateNextIcon />,
        'Next Customer',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Visits completed today: <strong>{visits.length}</strong>. Continue to another shop or end the route.
          </Typography>
          {visits.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
              {visits.slice(-3).map((vLog, i) => (
                <Chip
                  key={`${vLog.customer}-${i}`}
                  size="small"
                  label={`${vLog.customer} · ${formatCurrency(vLog.orderTotal)} · ${vLog.checkedOutAt}`}
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Box>
          )}
        </>,
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<NavigateNextIcon />}
            sx={primaryButtonSx}
            onClick={() => go('new-shop?')}
          >
            Next Customer
          </Button>
          <Button variant="outlined" startIcon={<FlagIcon />} onClick={() => go('end')} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            End Route
          </Button>
        </>,
      )
      break

    case 'end':
      panel = card(
        <FlagIcon />,
        'End Route',
        <Typography variant="body2" color="text.secondary">
          Close the field day for {market}. {visits.length} visit{visits.length === 1 ? '' : 's'} ready to sync.
        </Typography>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('upload')}>
          End Route
        </Button>,
      )
      break

    case 'upload':
      panel = card(
        <CloudUploadIcon />,
        'Upload GPS + Visit History',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Sync trail points, check-ins, orders, and collections to the server.
          </Typography>
          <Alert severity={uploaded ? 'success' : 'info'} sx={{ borderRadius: '10px' }}>
            {uploaded
              ? `Uploaded ${visits.length} visits and GPS trail for ${market}`
              : 'Ready to upload — connection required'}
          </Alert>
        </>,
        <>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploaded(true)}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Upload Now
          </Button>
          <Button variant="contained" color="primary" disabled={!uploaded} sx={primaryButtonSx} onClick={() => go('learned')}>
            Continue
          </Button>
        </>,
      )
      break

    case 'learned':
      panel = card(
        <AutoAwesomeIcon />,
        'Route Learned',
        <Typography variant="body2" color="text.secondary">
          The system learned your stop sequence, dwell times, and new outlets from today&apos;s GPS + visit history.
          Future days can reuse this pattern for {market}.
        </Typography>,
        <Button variant="contained" color="primary" sx={primaryButtonSx} onClick={() => go('suggestions')}>
          View Suggestions
        </Button>,
      )
      break

    case 'suggestions':
      panel = card(
        <LightbulbIcon />,
        'Future Route Suggestions',
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Suggested stops for your next day based on today&apos;s coverage and remaining outlets.
          </Typography>
          <Grid container spacing={1}>
            {suggestions.map((s, i) => (
              <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 700 }}>
                    Stop {i + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.address}</Typography>
                </Paper>
              </Grid>
            ))}
            {suggestions.length === 0 && (
              <Typography variant="body2" color="text.secondary">All known outlets were visited today.</Typography>
            )}
          </Grid>
          <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: mix.primary(6) }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>Day summary</Typography>
            <Typography variant="body2">
              {visits.length} visits · {formatCurrency(visits.reduce((s, x) => s + x.orderTotal, 0))} orders ·{' '}
              {formatCurrency(visits.reduce((s, x) => s + x.payment, 0))} collected
            </Typography>
          </Box>
        </>,
        <Button
          variant="contained"
          color="primary"
          sx={primaryButtonSx}
          onClick={() => {
            setStep('start')
            setGpsOn(false)
            setVisits([])
            setUploaded(false)
            setExtraCustomers([])
            setMsg('Ready for a new field day')
          }}
        >
          Start New Day
        </Button>,
      )
      break
  }

  return (
    <PageShell
      title="Field Day"
      subtitle="Start Day → GPS → Visit → Order → Payment → End Route → Suggestions"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Route Management' },
        { label: 'Field Day' },
      ]}
    >
      <RouteWorkflowStrip activeStep={STRIP_INDEX[step]} />

      {msg && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setMsg('')}>
          {msg}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>{panel}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...whiteCardSx, p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Today so far</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <SummaryRow label="GPS" value={gpsOn ? 'On' : 'Off'} />
              <SummaryRow label="Market" value={market} />
              <SummaryRow label="Visits" value={String(visits.length)} />
              <SummaryRow label="Orders" value={formatCurrency(visits.reduce((s, x) => s + x.orderTotal, 0))} />
              <SummaryRow label="Collected" value={formatCurrency(visits.reduce((s, x) => s + x.payment, 0))} />
            </Box>
            {visits.length > 0 && (
              <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${v.border}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: v.textSecondary }}>Visit log</Typography>
                {visits.map((vLog, i) => (
                  <Typography key={`${vLog.customer}-${i}`} variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                    {i + 1}. {vLog.customer} · {formatCurrency(vLog.payment)}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  )
}
