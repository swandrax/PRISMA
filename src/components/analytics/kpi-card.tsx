"use client"

import { ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    title: string
    value: string | number
    icon?: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    percentageChange?: number
    status?: 'good' | 'warning' | 'danger'
    description?: string
    className?: string
}

export function KpiCard({ title, value, icon, trend, percentageChange, status, description, className }: KpiCardProps) {
    const renderTrendIcon = () => {
        if (!trend) return null;
        if (trend === 'up') return <TrendingUp className="h-4 w-4" />
        if (trend === 'down') return <TrendingDown className="h-4 w-4" />
        return <Minus className="h-4 w-4" />
    }

    const renderStatusIcon = () => {
        if (!status) return null;
        if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        if (status === 'warning') return <AlertCircle className="h-4 w-4 text-amber-500" />
        if (status === 'danger') return <AlertCircle className="h-4 w-4 text-rose-500" />
        return null;
    }

    const getTrendColor = () => {
        if (!trend || !status) return "text-slate-500 dark:text-slate-400";
        // Trend up is good for income, bad for expense. That's why we use `status` to determine color
        if (status === 'good') return "text-emerald-500"
        if (status === 'warning') return "text-amber-500"
        if (status === 'danger') return "text-rose-500"
        return "text-slate-500 dark:text-slate-400"
    }

    return (
        <Card className={cn("overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {title}
                </CardTitle>
                <div className="text-slate-400 dark:text-slate-500">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {value}
                </div>
                {(trend || percentageChange !== undefined || description) && (
                    <div className="mt-2 flex items-center text-xs space-x-2">
                        {(trend || percentageChange !== undefined) && (
                            <span className={cn("flex items-center space-x-1 font-medium", getTrendColor())}>
                                {renderTrendIcon()}
                                {percentageChange !== undefined && <span>{Math.abs(percentageChange)}%</span>}
                            </span>
                        )}
                        {description && (
                            <span className="text-slate-500 dark:text-slate-400 flex-1 truncate">
                                {description}
                            </span>
                        )}
                        {renderStatusIcon()}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
