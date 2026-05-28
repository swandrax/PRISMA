// c:\Users\user\Desktop\prisma\src\app\rw-admin\laporan\page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Filter } from "lucide-react"

interface LaporanRT {
    rtKode: string;
    rtNama: string;
    saldo: number;
    pemasukan: number;
    pengeluaran: number;
    selisih: number;
}

export default function LaporanRWPage() {
    const [data, setData] = useState<LaporanRT[]>([])
    const [loading, setLoading] = useState(false)
    
    // Filter State
    const [bulan, setBulan] = useState(new Date().toLocaleString('id-ID', { month: 'long' }))
    const [tahun, setTahun] = useState(new Date().getFullYear().toString())
    
    const supabase = createClient()

    const fetchLaporan = async () => {
        setLoading(true)
        const { data: rts } = await supabase.from('rt_units').select('id, kode_rt, nama').eq('is_active', true)
        
        if (!rts) {
            setLoading(false)
            return
        }

        const laporanData: LaporanRT[] = []

        for (const rt of rts) {
            const { data: keuangan } = await supabase
                .from('keuangan_bulanan')
                .select('saldo, pemasukan, pengeluaran')
                .eq('rt_id', rt.id)
                .eq('bulan', bulan)
                .eq('tahun', tahun)
                .single()

            const p = keuangan?.pemasukan || 0
            const pOut = keuangan?.pengeluaran || 0
            const saldo = keuangan?.saldo || 0
            
            laporanData.push({
                rtKode: rt.kode_rt,
                rtNama: rt.nama,
                saldo: saldo,
                pemasukan: p,
                pengeluaran: pOut,
                selisih: p - pOut
            })
        }

        setData(laporanData)
        setLoading(false)
    }

    useEffect(() => {
        fetchLaporan()
    }, [bulan, tahun])

    const handlePrint = () => {
        window.print()
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

    const totalSaldo = data.reduce((a, b) => a + b.saldo, 0)
    const totalMasuk = data.reduce((a, b) => a + b.pemasukan, 0)
    const totalKeluar = data.reduce((a, b) => a + b.pengeluaran, 0)
    const totalSelisih = data.reduce((a, b) => a + b.selisih, 0)

    const bulanOptions = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    const tahunOptions = ["2026", "2025", "2024"]

    return (
        <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Section (Hidden in print) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Laporan Keuangan Konsolidasi</h1>
                        <p className="text-slate-500">Rekapitulasi keuangan seluruh RT di RW 09.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 px-2 border-r border-slate-200">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500 font-medium">Filter</span>
                        </div>
                        <select 
                            value={bulan} 
                            onChange={e => setBulan(e.target.value)}
                            className="text-sm border-0 focus:ring-0 bg-transparent text-slate-700 font-medium"
                        >
                            {bulanOptions.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select 
                            value={tahun} 
                            onChange={e => setTahun(e.target.value)}
                            className="text-sm border-0 focus:ring-0 bg-transparent text-slate-700 font-medium"
                        >
                            {tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        
                        <Button variant="outline" size="sm" onClick={handlePrint} className="ml-2">
                            <FileDown className="w-4 h-4 mr-2" /> Export PDF
                        </Button>
                    </div>
                </div>

                {/* Print Title (Visible only in print) */}
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-2xl font-bold uppercase">Laporan Konsolidasi Keuangan RW 09</h1>
                    <p className="text-lg">Periode: {bulan} {tahun}</p>
                    <div className="border-b-2 border-black w-full mt-4"></div>
                </div>

                <Card className="print:shadow-none print:border-0">
                    <CardHeader className="print:hidden">
                        <CardTitle>Data Keuangan per RT ({bulan} {tahun})</CardTitle>
                    </CardHeader>
                    <CardContent className="print:p-0">
                        {loading ? (
                            <p className="text-center py-12 text-slate-500">Memuat laporan...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 print:bg-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-slate-200">Unit RT</th>
                                            <th className="px-4 py-3 border-b border-slate-200 text-right">Saldo Kas</th>
                                            <th className="px-4 py-3 border-b border-slate-200 text-right">Pemasukan</th>
                                            <th className="px-4 py-3 border-b border-slate-200 text-right">Pengeluaran</th>
                                            <th className="px-4 py-3 border-b border-slate-200 text-right">Selisih Bersih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => (
                                            <tr key={item.rtKode} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-3 font-medium text-slate-900 border-b border-slate-100">
                                                    {item.rtNama} <span className="text-slate-400 text-xs ml-1">({item.rtKode})</span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-700 border-b border-slate-100">
                                                    {formatCurrency(item.saldo)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-emerald-600 border-b border-slate-100">
                                                    {formatCurrency(item.pemasukan)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-rose-600 border-b border-slate-100">
                                                    {formatCurrency(item.pengeluaran)}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-medium border-b border-slate-100 ${item.selisih >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {item.selisih > 0 ? '+' : ''}{formatCurrency(item.selisih)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                                            <td className="px-4 py-4 font-bold text-base">TOTAL RW 09</td>
                                            <td className="px-4 py-4 text-right font-bold text-base">{formatCurrency(totalSaldo)}</td>
                                            <td className="px-4 py-4 text-right font-bold text-base text-emerald-400 print:text-black">{formatCurrency(totalMasuk)}</td>
                                            <td className="px-4 py-4 text-right font-bold text-base text-rose-400 print:text-black">{formatCurrency(totalKeluar)}</td>
                                            <td className={`px-4 py-4 text-right font-bold text-base ${totalSelisih >= 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black'}`}>
                                                {formatCurrency(totalSelisih)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                        
                        <div className="hidden print:block mt-20 text-sm">
                            <div className="flex justify-between px-10">
                                <div className="text-center">
                                    <p className="mb-16">Mengetahui,</p>
                                    <p className="font-bold underline">Ketua RW 09</p>
                                </div>
                                <div className="text-center">
                                    <p className="mb-16">Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
                                    <p className="font-bold underline">Bendahara RW 09</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
