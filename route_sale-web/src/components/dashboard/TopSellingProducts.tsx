import { useState } from 'react'
import { Box, Typography, Link } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { formatCurrency } from '@/utils/export'
import { dash } from '@/components/dashboard/dashboardTokens'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'

export interface TopProduct {
  name: string
  quantity: number
  revenue: number
  growth?: number
  image?: string
}

function ProductImage({ name, image }: { name: string; image?: string }) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '10px',
          flexShrink: 0,
          bgcolor: '#F5F0E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: 22, color: '#2D6A4F' }} />
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={image}
      alt={name}
      onError={() => setFailed(true)}
      sx={{
        width: 48,
        height: 48,
        borderRadius: '10px',
        flexShrink: 0,
        objectFit: 'cover',
        border: dash.cardBorder,
      }}
    />
  )
}

export function TopSellingProducts({ products }: { products: TopProduct[] }) {
  return (
    <DashboardPanel
      title="Top Selling Products"
      action={
        <Link href="#" underline="hover" sx={{ fontSize: '12px', fontWeight: 600, color: '#2D6A4F' }}>
          View All
        </Link>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {products.map((p, i) => (
          <Box
            key={p.name}
            sx={{
              py: 1.25,
              borderBottom: i < products.length - 1 ? dash.cardBorder : 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <ProductImage name={p.name} image={p.image} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#111827' }} noWrap>
                  {p.name}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: dash.body.color, mt: 0.25 }}>
                  {p.quantity.toLocaleString()} units sold
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                  {formatCurrency(p.revenue)}
                </Typography>
                {p.growth != null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, mt: 0.25 }}>
                    <TrendingUpIcon sx={{ fontSize: 11, color: dash.trendUp }} />
                    <Typography sx={{ color: dash.trendUp, fontWeight: 600, fontSize: '11px' }}>
                      +{p.growth}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardPanel>
  )
}
