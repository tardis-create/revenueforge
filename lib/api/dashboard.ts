// Types for dashboard stats data
export interface StatTrend {
  value: number
  label: string
  direction: "up" | "down" | "neutral"
}

export interface StatData {
  title: string
  value: string
  trend?: StatTrend
  delay: number
}

export interface DashboardStatsData {
  totalLeads: StatData
  activeQuotes: StatData
  revenue: StatData
  conversionRate: StatData
}

// Mock data - in production, this would fetch from PocketBase API
export async function fetchDashboardStats(): Promise<DashboardStatsData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    totalLeads: {
      title: "Total Leads",
      value: "1,234",
      trend: {
        value: 12.5,
        label: "vs last month",
        direction: "up",
      },
      delay: 0.1,
    },
    activeQuotes: {
      title: "Active Quotes",
      value: "89",
      trend: {
        value: 8.3,
        label: "vs last month",
        direction: "up",
      },
      delay: 0.2,
    },
    revenue: {
      title: "Revenue",
      value: "₹45.2L",
      trend: {
        value: 15.7,
        label: "vs last month",
        direction: "up",
      },
      delay: 0.3,
    },
    conversionRate: {
      title: "Conversion Rate",
      value: "24.8%",
      trend: {
        value: 3.2,
        label: "vs last month",
        direction: "down",
      },
      delay: 0.4,
    },
  }
}
