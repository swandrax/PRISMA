// c:\Users\user\Desktop\prisma\src\app\rw-admin\rt-list\page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ExternalLink, Activity } from "lucide-react"

interface RTUnit {
    id: string;
    kode_rt: string;
    nama: string;
    subdomain: string;
    is_active: boolean;
    created_at: string;
}

export default function RTList() {
    const [rtList, setRtList] = useState<RTUnit[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchRTs() {
            setLoading(true)
            const { data } = await supabase
                .from('rt_units')
                .select('*')
                .order('kode_rt', { ascending: true })
            
            if (data) {
                setRtList(data)
            }
            setLoading(false)
        }
        fetchRTs()
    }, [])

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        // Normally this requires super_admin permissions and an API or RPC, 
        // since frontend supabase client shouldn't easily update rt_units unless RLS allows rw_admin
        const { error } = await supabase
            .from('rt_units')
            .update({ is_active: !currentStatus })
            .eq('id', id)
            
        if (!error) {
            setRtList(prev => prev.map(rt => rt.id === id ? { ...rt, is_active: !currentStatus } : rt))
        } else {
            alert('Gagal mengubah status. Pastikan Anda memiliki akses Super Admin.')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Daftar RT (Multi-tenant)</h1>
                    <p className="text-slate-500">Kelola semua instansi RT yang terdaftar dalam sistem.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Unit RT Terdaftar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8 text-slate-500">Memuat data...</p>
                        ) : rtList.length === 0 ? (
                            <p className="text-center py-8 text-slate-500">Belum ada RT yang didaftarkan.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Kode</th>
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3">Subdomain</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right rounded-tr-lg">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rtList.map(rt => (
                                            <tr key={rt.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{rt.kode_rt}</td>
                                                <td className="px-4 py-3">{rt.nama}</td>
                                                <td className="px-4 py-3 font-mono text-indigo-600">
                                                    <a 
                                                        href={`https://${rt.subdomain}.prisma-kemayoran.id`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="hover:underline flex items-center gap-1"
                                                    >
                                                        {rt.subdomain} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {rt.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                                                            <CheckCircle2 className="w-3 h-3" /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                                            <XCircle className="w-3 h-3" /> Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => toggleStatus(rt.id, rt.is_active)}
                                                    >
                                                        {rt.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
