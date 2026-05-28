// c:\Users\user\Desktop\prisma\src\app\rw-admin\onboarding\page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function OnboardingRTPage() {
    const [loading, setLoading] = useState(false)
    const [successData, setSuccessData] = useState<{ subdomain: string, url: string } | null>(null)
    const [error, setError] = useState("")

    // Form states
    const [kodeRt, setKodeRt] = useState("")
    const [namaRt, setNamaRt] = useState("")
    const [alamat, setAlamat] = useState("")
    const [namaKetua, setNamaKetua] = useState("")
    const [emailKetua, setEmailKetua] = useState("")
    const [tgPengurus, setTgPengurus] = useState("")
    const [tgKeuangan, setTgKeuangan] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        
        try {
            const res = await fetch("/api/onboarding/setup-rt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kode_rt: kodeRt,
                    nama_rt: namaRt,
                    alamat,
                    nama_ketua_rt: namaKetua,
                    email_ketua_rt: emailKetua,
                    telegram_chat_pengurus: tgPengurus,
                    telegram_chat_keuangan: tgKeuangan
                })
            })

            const data = await res.json()
            if (res.ok) {
                setSuccessData({ subdomain: data.subdomain, url: data.loginUrl })
                // Reset form
                setKodeRt("")
                setNamaRt("")
                setAlamat("")
                setNamaKetua("")
                setEmailKetua("")
                setTgPengurus("")
                setTgKeuangan("")
            } else {
                setError(data.error || "Gagal mendaftarkan RT baru.")
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem.")
        } finally {
            setLoading(false)
        }
    }

    if (successData) {
        return (
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="border-emerald-200 bg-emerald-50/50">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl text-emerald-800">RT Berhasil Didaftarkan!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-6">
                            <p className="text-emerald-700">
                                Link akses untuk warga dan pengurus RT tersebut telah aktif di:
                            </p>
                            <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-sm text-lg font-mono font-bold text-slate-800">
                                {successData.subdomain}.prisma-kemayoran.id
                            </div>
                            <p className="text-sm text-slate-600">
                                Akun Ketua RT telah dibuat. Email aktivasi/reset password (tergantung konfigurasi Supabase Auth) 
                                telah dikirim ke alamat email ketua RT. 
                            </p>
                            <div className="pt-4 flex justify-center gap-4">
                                <Button variant="outline" onClick={() => setSuccessData(null)}>Daftar RT Lain</Button>
                                <Link href="/rw-admin/rt-list">
                                    <Button>Lihat Daftar RT</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Onboarding RT Baru</h1>
                    <p className="text-slate-500">Daftarkan RT baru ke dalam sistem PRISMA Kemayoran.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data RT & Ketua</CardTitle>
                        <CardDescription>
                            Isi formulir berikut dengan data yang valid. Subdomain akan dibuat otomatis dari Kode RT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 border-r border-slate-100 md:pr-6">
                                    <h3 className="font-semibold text-slate-700 border-b pb-2">Informasi RT</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="kode_rt">Kode RT (misal: rt05)</Label>
                                        <Input 
                                            id="kode_rt" 
                                            placeholder="rt05" 
                                            required 
                                            value={kodeRt} 
                                            onChange={(e) => setKodeRt(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} 
                                        />
                                        <p className="text-xs text-slate-400">Akan menjadi subdomain: {kodeRt || '...'}.prisma-kemayoran.id</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_rt">Nama Lengkap RT</Label>
                                        <Input id="nama_rt" placeholder="RT 05 / RW 09" required value={namaRt} onChange={(e) => setNamaRt(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="alamat">Alamat Sekretariat/Balai Warga</Label>
                                        <Input id="alamat" placeholder="Jln. Contoh No 123" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tg_pengurus">ID Grup Telegram Pengurus (Opsional)</Label>
                                        <Input id="tg_pengurus" placeholder="-100123456789" value={tgPengurus} onChange={(e) => setTgPengurus(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tg_keuangan">ID Grup Telegram Keuangan (Opsional)</Label>
                                        <Input id="tg_keuangan" placeholder="-100123456789" value={tgKeuangan} onChange={(e) => setTgKeuangan(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-700 border-b pb-2">Data Ketua RT</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_ketua">Nama Ketua RT</Label>
                                        <Input id="nama_ketua" placeholder="Nama Lengkap" required value={namaKetua} onChange={(e) => setNamaKetua(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email_ketua">Email Akses Admin</Label>
                                        <Input id="email_ketua" type="email" placeholder="email@contoh.com" required value={emailKetua} onChange={(e) => setEmailKetua(e.target.value)} />
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg mt-4 border border-slate-200">
                                        <p className="text-sm text-slate-600">
                                            Sistem akan membuat akun baru secara otomatis dan memberikan role <span className="font-bold">ketua</span> pada RT yang baru dibuat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={loading} className="min-w-[150px]">
                                    {loading ? "Memproses..." : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" /> Daftarkan RT
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
