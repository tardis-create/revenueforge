'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AnimatedContent } from './AnimatedContent'
import {
  leadsOverTimeData,
  revenueByMonthData,
  quoteStatusData,
} from '@/lib/mock-charts-data'

export function LeadsChart() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Leads Over Time</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={leadsOverTimeData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="date" 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fafafa',
              }}
              labelStyle={{ color: '#fafafa' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-zinc-400 text-sm">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Leads"
            />
            <Line
              type="monotone"
              dataKey="converted"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Converted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RevenueChart() {
  const formatCurrency = (value: number) => `₹${(value / 1000).toFixed(0)}k`
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Revenue by Month</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={revenueByMonthData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="month" 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fafafa',
              }}
              labelStyle={{ color: '#fafafa' }}
              formatter={(value: number) => [formatCurrency(value), '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-zinc-400 text-sm">{value}</span>
              )}
            />
            <Bar 
              dataKey="revenue" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Bar 
              dataKey="target" 
              fill="#27272a" 
              radius={[4, 4, 0, 0]}
              name="Target"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function QuoteStatusChart() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quote Status Distribution</h3>
      <div className="h-64 md:h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={quoteStatusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#52525b' }}
            >
              {quoteStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fafafa',
              }}
              formatter={(value: number) => [`${value} quotes`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {quoteStatusData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-zinc-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardCharts() {
  return (
    <section className="mt-8 space-y-6">
      <AnimatedContent delay={0.5}>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Analytics Overview</h2>
      </AnimatedContent>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedContent delay={0.6}>
          <LeadsChart />
        </AnimatedContent>
        
        <AnimatedContent delay={0.7}>
          <RevenueChart />
        </AnimatedContent>
      </div>
      
      {/* Pie Chart - Full width on mobile, half on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedContent delay={0.8}>
          <QuoteStatusChart />
        </AnimatedContent>
        
        {/* Placeholder for future chart or summary */}
        <AnimatedContent delay={0.9}>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 h-full min-h-64 md:min-h-80 flex flex-col items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-zinc-400 text-lg mb-2">More Charts Coming Soon</p>
              <p className="text-zinc-500 text-sm">Additional analytics will be added here</p>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
