'use client'

import { useState } from 'react'
import { 
  BlurText, 
  AnimatedContent, 
  FadeContent,
  Magnet,
  ClickSpark,
  GlareHover,
  CountUp
} from '@/app/components'

interface MetricCard {
  label: string
  value: number
  change: number
  prefix?: string
  suffix?: string
}

interface ChartData {
  label: string
  value: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const metrics: MetricCard[] = [
    { label: 'Total Revenue', value: 485200, change: 12.5, prefix: '$' },
    { label: 'Quotes Sent', value: 156, change: 8.3 },
    { label: 'Conversion Rate', value: 68, change: 5.2, suffix: '%' },
    { label: 'Avg. Order Value', value: 3110, change: -2.1, prefix: '$' },
  ]

  const revenueData: ChartData[] = [
    { label: 'Week 1', value: 82000 },
    { label: 'Week 2', value: 95000 },
    { label: 'Week 3', value: 88000 },
    { label: 'Week 4', value: 102000 },
    { label: 'Week 5', value: 118000 },
  ]

  const categoryData: ChartData[] = [
    { label: 'Pumps', value: 35 },
    { label: 'Valves', value: 28 },
    { label: 'Motors', value: 18 },
    { label: 'Sensors', value: 12 },
    { label: 'Others', value: 7 },
  ]

  const topProducts = [
    { name: 'Industrial Pump Assembly', revenue: 124500, orders: 28, growth: 15.2 },
    { name: 'Heavy Duty Valve Set', revenue: 98700, orders: 45, growth: 8.7 },
    { name: 'Centrifugal Pump System', revenue: 87200, orders: 12, growth: 22.4 },
    { name: 'Motor Assembly Unit', revenue: 65400, orders: 67, growth: -3.2 },
    { name: 'Control Panel Module', revenue: 54300, orders: 34, growth: 11.8 },
  ]

  const recentActivity = [
    { type: 'quote', message: 'Quote QT-001 sent to TechCorp Industries', time: '2 hours ago' },
    { type: 'order', message: 'Order ORD-045 placed by BuildRight Construction', time: '4 hours ago' },
    { type: 'rfq', message: 'New RFQ from AquaFlow Systems', time: '6 hours ago' },
    { type: 'payment', message: 'Payment received for ORD-042', time: '8 hours ago' },
    { type: 'quote', message: 'Quote QT-003 accepted by EnergyPlus Ltd', time: '12 hours ago' },
  ]

  const maxRevenue = Math.max(...revenueData.map(d => d.value))
  const maxCategory = Math.max(...categoryData.map(d => d.value))

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      
      {/* Radial glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <AnimatedContent>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
                  <BlurText text="Analytics Dashboard" />
                </h1>
                <p className="text-zinc-400">
                  Business insights and performance metrics
                </p>
              </div>
            </AnimatedContent>
            
            {/* Time Range Selector */}
            <AnimatedContent delay={0.1}>
              <div className="flex items-center gap-2 p-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg backdrop-blur-sm">
                {(['7d', '30d', '90d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </AnimatedContent>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, i) => (
              <AnimatedContent key={metric.label} delay={0.05 * i}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={200}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-sm text-zinc-500">{metric.label}</div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        metric.change >= 0 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-100">
                      {metric.prefix && <span className="text-zinc-500">{metric.prefix}</span>}
                      <CountUp to={metric.value} duration={2} />
                      {metric.suffix && <span className="text-zinc-500">{metric.suffix}</span>}
                    </div>
                  </div>
                </GlareHover>
              </AnimatedContent>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <AnimatedContent delay={0.2}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">
                    Revenue Trend
                  </h3>
                  
                  <div className="space-y-3">
                    {revenueData.map((data, i) => (
                      <div key={data.label} className="flex items-center gap-4">
                        <div className="w-16 text-xs text-zinc-500">{data.label}</div>
                        <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg transition-all duration-1000"
                            style={{ width: `${(data.value / maxRevenue) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-end pr-3">
                            <span className="text-xs font-medium text-zinc-300">
                              ${(data.value / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>

            {/* Category Distribution */}
            <AnimatedContent delay={0.3}>
              <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">
                    Sales by Category
                  </h3>
                  
                  <div className="space-y-4">
                    {categoryData.map((data, i) => {
                      const colors = ['from-purple-600 to-purple-400', 'from-cyan-600 to-cyan-400', 'from-indigo-600 to-indigo-400', 'from-emerald-600 to-emerald-400', 'from-amber-600 to-amber-400']
                      return (
                        <div key={data.label} className="flex items-center gap-4">
                          <div className="w-20 text-sm text-zinc-300">{data.label}</div>
                          <div className="flex-1 h-6 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-lg transition-all duration-1000`}
                              style={{ width: `${(data.value / maxCategory) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-right text-sm font-medium text-zinc-100">
                            {data.value}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <AnimatedContent delay={0.4}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.1)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                      Top Products
                    </h3>
                    <a href="/admin/products" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                      View All
                    </a>
                  </div>
                  
                  <div className="space-y-4">
                    {topProducts.map((product, i) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-sm font-bold text-zinc-400">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-100">{product.name}</div>
                            <div className="text-xs text-zinc-500">{product.orders} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-zinc-100">
                            ${product.revenue.toLocaleString()}
                          </div>
                          <div className={`text-xs ${product.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {product.growth >= 0 ? '+' : ''}{product.growth}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>

            {/* Recent Activity */}
            <AnimatedContent delay={0.5}>
              <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity, i) => {
                      const icons: Record<string, { icon: string; color: string }> = {
                        quote: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-purple-500/10 text-purple-400' },
                        order: { icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'bg-cyan-500/10 text-cyan-400' },
                        rfq: { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'bg-amber-500/10 text-amber-400' },
                        payment: { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-500/10 text-emerald-400' },
                      }
                      const { icon, color } = icons[activity.type]
                      
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-100">{activity.message}</div>
                            <div className="text-xs text-zinc-600 mt-1">{activity.time}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          </div>
        </main>
    </div>
  )
}
