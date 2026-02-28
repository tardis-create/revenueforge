// Mock data for admin dashboard charts
// This will be replaced with API integration later

export interface LeadsDataPoint {
  date: string
  leads: number
  converted: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  target: number
}

export interface QuoteStatusData {
  name: string
  value: number
  color: string
}

// Line chart data - Leads over time (last 7 days)
export const leadsOverTimeData: LeadsDataPoint[] = [
  { date: 'Mon', leads: 12, converted: 4 },
  { date: 'Tue', leads: 19, converted: 7 },
  { date: 'Wed', leads: 8, converted: 3 },
  { date: 'Thu', leads: 25, converted: 10 },
  { date: 'Fri', leads: 18, converted: 6 },
  { date: 'Sat', leads: 14, converted: 5 },
  { date: 'Sun', leads: 22, converted: 9 },
]

// Bar chart data - Revenue by month (last 6 months)
export const revenueByMonthData: RevenueDataPoint[] = [
  { month: 'Sep', revenue: 42000, target: 40000 },
  { month: 'Oct', revenue: 58000, target: 45000 },
  { month: 'Nov', revenue: 51000, target: 50000 },
  { month: 'Dec', revenue: 73000, target: 60000 },
  { month: 'Jan', revenue: 65000, target: 65000 },
  { month: 'Feb', revenue: 82000, target: 70000 },
]

// Pie chart data - Quote status distribution
export const quoteStatusData: QuoteStatusData[] = [
  { name: 'Draft', value: 15, color: '#6b7280' },
  { name: 'Sent', value: 28, color: '#3b82f6' },
  { name: 'Accepted', value: 42, color: '#10b981' },
  { name: 'Rejected', value: 8, color: '#ef4444' },
  { name: 'Expired', value: 7, color: '#f59e0b' },
]
