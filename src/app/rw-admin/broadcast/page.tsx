// c:\Users\user\Desktop\prisma\src\app\rw-admin\broadcast\page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone, Send, Check } from "lucide-react"

export default function BroadcastPage() {
    const [rts, setRts] = useState<{id: string, nama: string, kode_rt: string}[]>([])
    const [selectedRts, setSelectedRts] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)

    const [judul, setJudul] = useState("")
    const [isi, setIsi] = useState("")
    const [kategori, setKategori] = useState("Pengumuman")

    const supabase = createClient()

    useEffect(() => {
        async function fetchRTs() {
            const { data } = await supabase.from('rt_units').select('id, nama, kode_rt').eq('is_active', true)
            if (data) {
                const typedData = data as { id: string; nama: string; kode_rt: string }[]
                setRts(typedData)
                // Select all by default
                setSelectedRts(typedData.map(rt => rt.id))
            }
            setLoading(false)
        }
        fetchRTs()
    }, [supabase])

    const toggleRt = (id: string) => {
        setSelectedRts(prev => 
            prev.includes(id) ? prev.filter(rtId => rtId !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedRts.length === rts.length) {
            setSelectedRts([])
        } else {
            setSelectedRts(rts.map(rt => rt.id))
        }
    }

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedRts.length === 0) {
            alert('Pilih minimal 1 RT tujuan.')
            return
        }

        setSending(true)
        const payload = selectedRts.map(rtId => ({
            judul: `[Info RW] ${judul}`,
            isi,
            kategori,
            rt_id: rtId,
            tanggal: new Date().toISOString(),
            is_pinned: true // Broadcast always pinned initially
        }))

        const { error } = await supabase.from('pengumuman').insert(payload)
        
        if (!error) {
            setSuccess(true)
            setJudul("")
            setIsi("")
            setTimeout(() => setSuccess(false), 5000)
        } else {
            alert('Gagal mengirim broadcast.')
        }
        setSending(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Broadcast Pengumuman</h1>
                        <p className="text-slate-500">Kirim informasi serentak ke berbagai wilayah RT.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pesan Pengumuman</CardTitle>
                                <CardDescription>Pesan ini akan muncul di dashboard tiap RT.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="broadcast-form" onSubmit={handleBroadcast} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="judul">Judul (otomatis diawali [Info RW])</Label>
                                        <Input 
                                            id="judul" 
                                            required 
                                            placeholder="Misal: Kerja Bakti Massal" 
                                            value={judul}
                                            onChange={e => setJudul(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kategori">Kategori</Label>
                                        <select 
                                            id="kategori"
                                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            value={kategori}
                                            onChange={e => setKategori(e.target.value)}
                                        >
                                            <option value="Pengumuman">Pengumuman</option>
                                            <option value="Kegiatan">Kegiatan</option>
                                            <option value="Keamanan">Keamanan</option>
                                            <option value="Sosial">Sosial</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="isi">Isi Pesan</Label>
                                        <Textarea 
                                            id="isi" 
                                            rows={6} 
                                            required 
                                            placeholder="Tuliskan detail pengumuman..."
                                            value={isi}
                                            onChange={e => setIsi(e.target.value)}
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {success && (
                            <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-2">
                                <Check className="w-5 h-5" /> Broadcast berhasil dikirim ke {selectedRts.length} RT.
                            </div>
                        )}

                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Target RT</CardTitle>
                                <CardDescription>Pilih wilayah RT penerima.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-sm text-slate-500">Memuat RT...</p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 pb-3 border-b">
                                            <input 
                                                type="checkbox" 
                                                id="check-all"
                                                className="w-4 h-4 rounded text-indigo-600"
                                                checked={selectedRts.length === rts.length && rts.length > 0}
                                                onChange={toggleAll}
                                            />
                                            <Label htmlFor="check-all" className="font-semibold cursor-pointer">
                                                Pilih Semua
                                            </Label>
                                        </div>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {rts.map(rt => (
                                                <div key={rt.id} className="flex items-center space-x-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`rt-${rt.id}`}
                                                        className="w-4 h-4 rounded text-indigo-600"
                                                        checked={selectedRts.includes(rt.id)}
                                                        onChange={() => toggleRt(rt.id)}
                                                    />
                                                    <Label htmlFor={`rt-${rt.id}`} className="cursor-pointer font-normal">
                                                        {rt.nama} <span className="text-slate-400 text-xs ml-1">({rt.kode_rt})</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button 
                            type="submit" 
                            form="broadcast-form" 
                            className="w-full text-base py-6"
                            disabled={sending || loading || selectedRts.length === 0}
                        >
                            {sending ? "Mengirim..." : (
                                <>
                                    <Send className="w-5 h-5 mr-2" /> Kirim ke {selectedRts.length} RT
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
