import { Card, CardContent, Skeleton, Grid } from '@mui/material'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent>
        <Skeleton width="30%" height={32} sx={{ mb: 2 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
        ))}
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Skeleton width="60%" />
              <Skeleton width="40%" height={40} sx={{ my: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Skeleton height={300} />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Skeleton height={300} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
