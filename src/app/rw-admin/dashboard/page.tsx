// c:\Users\user\Desktop\prisma\src\app\rw-admin\dashboard\page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AggregatedData {
    rtKode: string;
    rtNama: string;
    totalWarga: number;
    suratPending: number;
    saldoBulanIni: number;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
}

export default function RWAdminDashboard() {
    const [data, setData] = useState<AggregatedData[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            
            // 1. Get all active RTs
            const { data: rts } = await supabase.from('rt_units').select('id, kode_rt, nama').eq('is_active', true)
            
            if (!rts) return

            const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' })
            const currentYear = new Date().getFullYear().toString()

            const stats: AggregatedData[] = []

            for (const rt of rts) {
                // Fetch profiles count
                const { count: totalWarga } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('rt_id', rt.id)

                // Fetch pending surat count
                const { count: suratPending } = await supabase
                    .from('pengajuan_surat')
                    .select('*', { count: 'exact', head: true })
                    .eq('rt_id', rt.id)
                    .eq('status', 'menunggu')

                // Fetch keuangan for current month
                const { data: keuangan } = await supabase
                    .from('keuangan_bulanan')
                    .select('saldo, pemasukan, pengeluaran')
                    .eq('rt_id', rt.id)
                    .eq('bulan', currentMonth)
                    .eq('tahun', currentYear)
                    .single()

                stats.push({
                    rtKode: rt.kode_rt,
                    rtNama: rt.nama,
                    totalWarga: totalWarga || 0,
                    suratPending: suratPending || 0,
                    saldoBulanIni: keuangan?.saldo || 0,
                    pemasukanBulanIni: keuangan?.pemasukan || 0,
                    pengeluaranBulanIni: keuangan?.pengeluaran || 0,
                })
            }

            setData(stats)
            setLoading(false)
        }
        fetchStats()
    }, [supabase])

    const totalRWarga = data.reduce((acc, curr) => acc + curr.totalWarga, 0)
    const totalRSuratPending = data.reduce((acc, curr) => acc + curr.suratPending, 0)
    const totalRPemasukan = data.reduce((acc, curr) => acc + curr.pemasukanBulanIni, 0)
    const totalRPengeluaran = data.reduce((acc, curr) => acc + curr.pengeluaranBulanIni, 0)

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard RW 09</h1>
                    <p className="text-slate-500">Ringkasan statistik konsolidasi seluruh RT aktif.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Total Warga Terdaftar</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">{totalRWarga}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-l-4 border-l-amber-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Surat Menunggu (Semua RT)</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">{totalRSuratPending}</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-emerald-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Pemasukan Bulan Ini</p>
                                            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalRPemasukan)}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-rose-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Pengeluaran Bulan Ini</p>
                                            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalRPengeluaran)}</p>
                                        </div>
                                        <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                                            <TrendingDown className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Chart Data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Perbandingan Keuangan per RT</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="rtKode" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                                                <Tooltip formatter={(val) => formatCurrency(Number(val ?? 0))} />
                                                <Legend />
                                                <Bar dataKey="pemasukanBulanIni" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="pengeluaranBulanIni" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Table Data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status RT Detail</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3">Kode RT</th>
                                                    <th className="px-6 py-3 text-center">Warga</th>
                                                    <th className="px-6 py-3 text-center">Surat Pending</th>
                                                    <th className="px-6 py-3 text-right">Saldo Kas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.map(rt => (
                                                    <tr key={rt.rtKode} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-medium text-slate-900">{rt.rtKode.toUpperCase()}</td>
                                                        <td className="px-6 py-4 text-center">{rt.totalWarga}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            {rt.suratPending > 0 ? (
                                                                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-full">{rt.suratPending}</span>
                                                            ) : (
                                                                <span className="text-slate-400">0</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                                            {formatCurrency(rt.saldoBulanIni)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
