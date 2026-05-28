// c:\Users\user\Desktop\prisma\src\app\admin\pengumuman\page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, Edit, Check } from "lucide-react"
import Link from "next/link"

interface Pengumuman {
    id: string;
    judul: string;
    isi: string;
    kategori: string;
    tanggal: string;
    is_pinned: boolean;
}

export default function PengumumanAdminPage() {
    const [data, setData] = useState<Pengumuman[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Partial<Pengumuman>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [isFormVisible, setIsFormVisible] = useState(false)
    
    const supabase = createClient()

    const fetchPengumuman = useCallback(async () => {
        setLoading(true)
        const { data: pengumuman, error } = await supabase
            .from('pengumuman')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('tanggal', { ascending: false })

        if (error) {
            console.error(error)
        } else {
            setData(pengumuman || [])
        }
        setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            // We use setTimeout to defer the synchronous state update
            setTimeout(() => {
                fetchPengumuman()
            }, 0);
        }
        return () => { mounted = false }
    }, [fetchPengumuman])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.judul || !formData.isi || !formData.kategori) return

        const payload = {
            judul: formData.judul,
            isi: formData.isi,
            kategori: formData.kategori,
            tanggal: formData.tanggal || new Date().toISOString().split('T')[0],
            is_pinned: formData.is_pinned || false
        }

        if (isEditing && formData.id) {
            const { error } = await supabase
                .from('pengumuman')
                .update(payload)
                .eq('id', formData.id)
            if (!error) {
                setIsFormVisible(false)
                setIsEditing(false)
                setFormData({})
                fetchPengumuman()
            }
        } else {
            const { error } = await supabase
                .from('pengumuman')
                .insert([payload])
            if (!error) {
                setIsFormVisible(false)
                setFormData({})
                fetchPengumuman()
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
            const { error } = await supabase
                .from('pengumuman')
                .delete()
                .eq('id', id)
            if (!error) {
                fetchPengumuman()
            }
        }
    }

    const handleEdit = (item: Pengumuman) => {
        setFormData(item)
        setIsEditing(true)
        setIsFormVisible(true)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Kelola Pengumuman</h1>
                        <p className="text-slate-500">Buat, edit, dan hapus pengumuman untuk warga.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin">Kembali ke Dashboard</Link>
                        </Button>
                        <Button onClick={() => {
                            setIsFormVisible(true);
                            setIsEditing(false);
                            setFormData({ tanggal: new Date().toISOString().split('T')[0] });
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Pengumuman
                        </Button>
                    </div>
                </div>

                {isFormVisible && (
                    <Card className="mb-8 border-indigo-100 shadow-md">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                            <CardTitle className="text-indigo-900">
                                {isEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="judul">Judul Pengumuman</Label>
                                        <Input
                                            id="judul"
                                            required
                                            value={formData.judul || ''}
                                            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                            placeholder="Contoh: Kerja Bakti Minggu Ini"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kategori">Kategori</Label>
                                        <select 
                                            id="kategori"
                                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                            value={formData.kategori || ''}
                                            onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                        >
                                            <option value="">Pilih Kategori</option>
                                            <option value="Kegiatan">Kegiatan</option>
                                            <option value="Informasi">Informasi</option>
                                            <option value="Keamanan">Keamanan</option>
                                            <option value="Peringatan">Peringatan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isi">Isi Pengumuman</Label>
                                    <Textarea
                                        id="isi"
                                        required
                                        rows={5}
                                        value={formData.isi || ''}
                                        onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                                        placeholder="Tuliskan detail pengumuman di sini..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal">Tanggal</Label>
                                        <Input
                                            id="tanggal"
                                            type="date"
                                            required
                                            value={formData.tanggal || ''}
                                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="is_pinned"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={formData.is_pinned || false}
                                            onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                        />
                                        <Label htmlFor="is_pinned" className="cursor-pointer">Sematkan (Pin) ke Atas</Label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsFormVisible(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                        <Check className="w-4 h-4 mr-2" />
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Memuat data...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                                Belum ada pengumuman.
                            </div>
                        ) : (
                            data.map((item) => (
                                <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                item.kategori === 'Kegiatan' ? 'bg-blue-100 text-blue-800' :
                                                item.kategori === 'Informasi' ? 'bg-green-100 text-green-800' :
                                                item.kategori === 'Keamanan' ? 'bg-red-100 text-red-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {item.kategori}
                                            </span>
                                            {item.is_pinned && (
                                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
                                                    Pinned
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg leading-tight">{item.judul}</CardTitle>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                            {item.isi}
                                        </p>
                                        <div className="flex gap-2 pt-4 border-t mt-auto">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                                                <Edit className="w-3 h-3 mr-2" />
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                                <Trash className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
