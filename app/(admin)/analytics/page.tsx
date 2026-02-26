'use client'

import { useState } from 'react'
import { AnimatedContent, LiquidCard, CountUp } from '@/app/components'

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const metrics = [
    { label: 'Total Revenue', value: 485200, change: 12.5, prefix: '$' },
    { label: 'Quotes Sent', value: 156, change: 8.3 },
    { label: 'Conversion Rate', value: 68, change: 5.2, suffix: '%' },
    { label: 'Avg. Order Value', value: 3110, change: -2.1, prefix: '$' },
  ]
  const revenueData = [{ label: 'Week 1', value: 82000 }, { label: 'Week 2', value: 95000 }, { label: 'Week 3', value: 88000 }, { label: 'Week 4', value: 102000 }]
  const maxRevenue = Math.max(...revenueData.map(d => d.value))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-zinc-100">Analytics</h1><p className="text-zinc-400 mt-1">Business insights</p></div>
        <div className="flex items-center gap-2 p-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}>{range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <AnimatedContent key={metric.label} delay={0.05 * i}>
            <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl">
              <div className="flex items-start justify-between mb-4"><div className="text-sm text-zinc-500">{metric.label}</div><span className={`text-xs font-medium px-2 py-1 rounded ${metric.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{metric.change >= 0 ? '+' : ''}{metric.change}%</span></div>
              <div className="text-3xl font-bold text-zinc-100">{metric.prefix && <span className="text-zinc-500">{metric.prefix}</span>}<CountUp to={metric.value} duration={2} />{metric.suffix && <span className="text-zinc-500">{metric.suffix}</span>}</div>
            </div>
          </AnimatedContent>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatedContent delay={0.2}>
          <LiquidCard glassIntensity="low" className="p-6">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">Revenue Trend</h3>
            <div className="space-y-3">
              {revenueData.map((data) => (
                <div key={data.label} className="flex items-center gap-4">
                  <div className="w-16 text-xs text-zinc-500">{data.label}</div>
                  <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg" style={{ width: `${(data.value / maxRevenue) * 100}%` }} />
                    <div className="absolute inset-0 flex items-center justify-end pr-3"><span className="text-xs font-medium text-zinc-300">${(data.value / 1000).toFixed(0)}K</span></div>
                  </div>
                </div>
              ))}
            </div>
          </LiquidCard>
        </AnimatedContent>
        <AnimatedContent delay={0.3}>
          <LiquidCard glassIntensity="low" className="p-6">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6">Sales by Category</h3>
            {[{ label: 'Pumps', value: 35 }, { label: 'Valves', value: 28 }, { label: 'Motors', value: 18 }, { label: 'Sensors', value: 12 }, { label: 'Others', value: 7 }].map((data, i) => {
              const colors = ['from-purple-600', 'from-cyan-600', 'from-indigo-600', 'from-emerald-600', 'from-amber-600']
              return (
                <div key={data.label} className="flex items-center gap-4 mb-4">
                  <div className="w-20 text-sm text-zinc-300">{data.label}</div>
                  <div className="flex-1 h-6 bg-zinc-800/50 rounded-lg overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} to-transparent rounded-lg`} style={{ width: `${data.value}%` }} /></div>
                  <div className="w-12 text-right text-sm font-medium text-zinc-100">{data.value}%</div>
                </div>
              )
            })}
          </LiquidCard>
        </AnimatedContent>
      </div>
    </div>
  )
}
