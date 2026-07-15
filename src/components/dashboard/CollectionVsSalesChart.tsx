import { GroupedBarChartCard } from '@/components/charts/GroupedBarChartCard'
import type { ChartData } from '@/types/module'

const chartData: ChartData = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    { name: 'Collection', data: [45000, 52000, 38000, 65000, 48000, 55000, 72000, 68000, 51000, 85000, 42000, 60000] },
    { name: 'Sales', data: [35000, 41000, 31000, 52000, 39000, 44000, 58000, 54000, 41000, 68000, 34000, 48000] },
  ],
}

export function CollectionVsSalesChart() {
  return <GroupedBarChartCard title="Collection vs Sales" data={chartData} />
}
