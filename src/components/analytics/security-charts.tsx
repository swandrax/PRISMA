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
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnalyticsData } from "@/Services/analyticsService"

const STATUS_COLORS = ['#10b981', '#f59e0b']

interface SecurityChartsProps {
    security: AnalyticsData['security']
    administrative: AnalyticsData['administrative']
}

export function SecurityCharts({ security, administrative }: SecurityChartsProps) {
    if (!security || !administrative) return null;

    const securityStatusData = [
        { name: 'Resolved', value: security.resolvedReports },
        { name: 'Pending', value: security.pendingReports }
    ].filter(d => d.value > 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Administrative Requests Bar Chart */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Layanan Administrasi</CardTitle>
                    <CardDescription className="text-slate-500">
                        Distribusi permintaan surat pengantar warga.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        {administrative.requestsByType && administrative.requestsByType.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={administrative.requestsByType}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#64748b" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" name="Jumlah Request" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500 text-center">
                                Belum ada data layanan administrasi.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Security Status Donut Chart */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Status Laporan Keamanan</CardTitle>
                    <CardDescription className="text-slate-500">
                        Rasio penyelesaian laporan keamanan (Resolved vs Pending).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {securityStatusData && securityStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={securityStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {securityStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500 text-center">
                                Tidak ada laporan keamanan. Lingkungan aman terkendali.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
