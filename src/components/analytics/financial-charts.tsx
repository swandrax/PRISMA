"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnalyticsData } from "@/Services/analyticsService"

// Custom colors that match PRISMA RT 04 theme
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

interface FinancialChartsProps {
    financial: AnalyticsData['financial']
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
    }).format(value)
}

export function FinancialCharts({ financial }: FinancialChartsProps) {
    if (!financial) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Income vs Expense Bar Chart */}
            <Card className="col-span-1 lg:col-span-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Pemasukan vs Pengeluaran</CardTitle>
                    <CardDescription className="text-slate-500">
                        Perbandingan arus kas selama periode berjalan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        {financial.monthlyTrend && financial.monthlyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={financial.monthlyTrend}
                                    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatCompactCurrency}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        // @ts-expect-error recharts type mismatch
                                        formatter={(value: number) => [formatCurrency(value), ""]}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                                Belum ada data untuk periode ini.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Expense Distribution Pie Chart */}
            <Card className="col-span-1 lg:col-span-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Distribusi Pengeluaran</CardTitle>
                    <CardDescription className="text-slate-500">
                        Kategori pengeluaran terbesar RT 04.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {financial.expenseCategories && financial.expenseCategories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={financial.expenseCategories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {financial.expenseCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: unknown) => [formatCurrency(Number(value)), ""]}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500 text-center">
                                Belum tersedia data pengeluaran.<br/>Tambahkan transaksi pengeluaran untuk melihat analisis.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Net Balance Trend Line Chart */}
            <Card className="col-span-1 lg:col-span-7 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Tren Saldo Kas Bersih</CardTitle>
                    <CardDescription className="text-slate-500">
                        Pertumbuhan atau penurunan kas warga dari waktu ke waktu.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[250px] w-full">
                        {financial.monthlyTrend && financial.monthlyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={financial.monthlyTrend}
                                    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatCompactCurrency}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        formatter={(value: unknown) => [formatCurrency(Number(value)), "Saldo"]}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="balance" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                                Belum ada data untuk periode ini.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
