"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react"

// Mock data for simplified view
const kasData = {
    saldo: "Rp 14.250.000",
    masukBulanIni: "Rp 2.500.000",
    keluarBulanIni: "Rp 850.000",
    penggunaanTerbaru: [
        { id: 1, desc: "Perbaikan Lampu Jalan Blok B", amount: "Rp 350.000", date: "28 Agustus 2026", type: "out" },
        { id: 2, desc: "Beli Alat Kebersihan (Sapu, Pengki)", amount: "Rp 150.000", date: "25 Agustus 2026", type: "out" },
        { id: 3, desc: "Iuran Warga Kolektif", amount: "Rp 1.500.000", date: "15 Agustus 2026", type: "in" },
    ]
}

export default function KeuanganPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Laporan Kas RT</h1>
                <p className="text-muted-foreground mt-2">Transparansi keuangan untuk semua warga RT 04.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Saldo Kas Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{kasData.saldo}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                            Uang Masuk Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{kasData.masukBulanIni}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                            Uang Digunakan Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{kasData.keluarBulanIni}</div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-4">Penggunaan Terbaru</h2>
            <Card>
                <div className="divide-y">
                    {kasData.penggunaanTerbaru.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full mt-1 ${item.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.type === 'in' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{item.desc}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                        <Clock className="w-3 h-3" />
                                        {item.date}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-bold ${item.type === 'in' ? 'text-green-600' : 'text-foreground'}`}>
                                {item.type === 'in' ? '+' : '-'}{item.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
