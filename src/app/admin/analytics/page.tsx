"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Users, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/analytics/kpi-card"
import { FinancialCharts } from "@/components/analytics/financial-charts"
import { SecurityCharts } from "@/components/analytics/security-charts"
import { AiInsights } from "@/components/analytics/ai-insights"
import { analyticsService, AnalyticsData } from "@/Services/analyticsService"
import { Card, CardContent } from "@/components/ui/card"

export default function AnalyticsDashboardPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState("current_month")

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true)
            try {
                // In a real app, period string would determine the query
                const result = await analyticsService.getAnalyticsOverview(period)
                setData(result)
            } catch (error) {
                console.error("Error fetching analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchAnalytics()
    }, [period])

    const handleExport = () => {
        alert("Fitur Export PDF/CSV akan segera hadir.")
    }

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-500">Memuat Analytics Engine...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/admin" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Admin
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics & Transparency</h1>
                        <p className="text-slate-500 mt-1">
                            Dashboard Business Intelligence RT 04 berbasis data riil.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            value={period} 
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-[160px] h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="current_month">Bulan Ini</option>
                            <option value="last_month">Bulan Lalu</option>
                            <option value="q1">Kuartal 1 (Q1)</option>
                            <option value="ytd">Tahun Ini (YTD)</option>
                        </select>

                        <Button variant="outline" className="bg-white dark:bg-slate-900">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* AI Insights Layer */}
                <AiInsights insights={data.insights} />

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title="Saldo Kas Saat Ini"
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.financial.currentBalance)}
                        icon={<Wallet className="h-4 w-4" />}
                        trend={data.financial.netCashflow > 0 ? 'up' : 'down'}
                        status={data.financial.netCashflow > 0 ? 'good' : 'warning'}
                        description={data.financial.netCashflow > 0 ? "Kas bertumbuh" : "Kas menyusut"}
                    />
                    <KpiCard
                        title="Total Pemasukan"
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.financial.totalIncome)}
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend="up"
                        status="good"
                    />
                    <KpiCard
                        title="Total Pengeluaran"
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.financial.totalExpense)}
                        icon={<TrendingDown className="h-4 w-4" />}
                        trend={data.financial.totalExpense > data.financial.totalIncome ? 'down' : 'neutral'}
                        status={data.financial.totalExpense > data.financial.totalIncome ? 'warning' : 'good'}
                    />
                    <KpiCard
                        title="Total Laporan Warga"
                        value={data.administrative.totalRequests + data.security.totalReports}
                        icon={<Users className="h-4 w-4" />}
                        description={`${data.security.pendingReports} perlu tindak lanjut`}
                        status={data.security.pendingReports > 0 ? 'warning' : 'good'}
                    />
                </div>

                {/* Financial Analytics */}
                <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Financial Performance
                </h2>
                <FinancialCharts financial={data.financial} />

                {/* Administrative & Security Analytics */}
                <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Operasional & Keamanan
                </h2>
                <SecurityCharts security={data.security} administrative={data.administrative} />

                {/* Community Activity Analytics - Empty State Handling */}
                <h2 className="text-xl font-semibold mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Community Analytics
                </h2>
                <Card className="border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/20">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <Users className="h-12 w-12 text-slate-400 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Data Partisipasi Warga Belum Tersedia
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                            Fitur pencatatan kehadiran acara komunitas (Kerja Bakti, Rapat, dsb) belum memiliki data yang cukup untuk dianalisis pada periode ini.
                        </p>
                        <Button variant="outline" className="mt-4" disabled>
                            Integrasikan Sistem Absensi (Segera)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
