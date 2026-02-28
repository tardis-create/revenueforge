"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { AnimatedContent } from "./AnimatedContent"

export interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  delay?: number
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  delay = 0,
  className = "" 
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4" />
      case "down":
        return <TrendingDown className="w-4 h-4" />
      case "neutral":
        return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return "text-zinc-400"
    switch (trend.direction) {
      case "up":
        return "text-emerald-400"
      case "down":
        return "text-red-400"
      case "neutral":
        return "text-zinc-400"
    }
  }

  return (
    <AnimatedContent delay={delay} className={className}>
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-zinc-700/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-zinc-800/50 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-zinc-100">{value}</p>
        {trend && (
          <p className="text-xs text-zinc-500 mt-2">{trend.label}</p>
        )}
      </div>
    </AnimatedContent>
  )
}
