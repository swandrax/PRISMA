"use client"

import { Lightbulb, AlertTriangle, Info, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsData } from "@/Services/analyticsService"

interface AiInsightsProps {
    insights: AnalyticsData['insights']
}

export function AiInsights({ insights }: AiInsightsProps) {
    if (!insights || insights.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />
            case 'anomaly':
                return <ShieldAlert className="h-5 w-5 text-rose-500" />
            case 'recommendation':
                return <Lightbulb className="h-5 w-5 text-blue-500" />
            default:
                return <Info className="h-5 w-5 text-emerald-500" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'warning':
                return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
            case 'anomaly':
                return "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
            case 'recommendation':
                return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
            default:
                return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Insights & Rekomendasi
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                    {insights.map((insight, index) => (
                        <div 
                            key={index} 
                            className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor(insight.type)}`}
                        >
                            <div className="mt-0.5">
                                {getIcon(insight.type)}
                            </div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {insight.message}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
