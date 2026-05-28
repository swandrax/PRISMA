// c:\Users\user\Desktop\prisma\src\app\admin\galeri\page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash, UploadCloud, Image as ImageIcon, Check } from "lucide-react"
import Image from "next/image"

interface GaleriItem {
    id: string;
    judul: string;
    kategori: string;
    image_url: string;
    tanggal: string;
}

export default function AdminGaleriPage() {
    const [data, setData] = useState<GaleriItem[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isFormVisible, setIsFormVisible] = useState(false)

    // Form state
    const [judul, setJudul] = useState("")
    const [deskripsi, setDeskripsi] = useState("")
    const [kategori, setKategori] = useState("")
    const [isFeatured, setIsFeatured] = useState(false)
    
    // File state
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const supabase = createClient()

    const fetchGaleri = async () => {
        setLoading(true)
        const { data: items, error } = await supabase
            .from('galeri')
            .select('*')
            .order('tanggal', { ascending: false })

        if (!error) setData(items || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchGaleri()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !judul || !kategori) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("judul", judul)
        formData.append("deskripsi", deskripsi)
        formData.append("kategori", kategori)
        formData.append("is_featured", String(isFeatured))

        try {
            const res = await fetch("/api/galeri/upload", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                // Reset form
                setFile(null)
                setPreviewUrl(null)
                setJudul("")
                setDeskripsi("")
                setKategori("")
                setIsFeatured(false)
                setIsFormVisible(false)
                if (fileInputRef.current) fileInputRef.current.value = ""
                
                fetchGaleri()
            } else {
                const err = await res.json()
                alert(`Upload failed: ${err.error}`)
            }
        } catch (error) {
            console.error("Upload error", error)
            alert("Terjadi kesalahan saat upload.")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (item: GaleriItem) => {
        if (!confirm("Hapus foto ini? File dan data akan dihapus permanen.")) return

        // Extract filename from URL
        const urlObj = new URL(item.image_url)
        const pathParts = urlObj.pathname.split('/')
        const filename = pathParts[pathParts.length - 1]

        // Delete from DB first
        const { error: dbError } = await supabase.from('galeri').delete().eq('id', item.id)
        
        if (!dbError) {
            // Delete from storage
            await supabase.storage.from('galeri').remove([filename])
            fetchGaleri()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Kelola Galeri</h1>
                        <p className="text-slate-500">Upload dan kelola dokumentasi foto kegiatan.</p>
                    </div>
                    <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                        {isFormVisible ? "Batal" : "Upload Foto Baru"}
                    </Button>
                </div>

                {isFormVisible && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Upload Foto Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left: File input & preview */}
                                    <div className="space-y-4">
                                        <Label>Foto</Label>
                                        <div 
                                            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${previewUrl ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-300 hover:bg-slate-50'}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {previewUrl ? (
                                                <div className="relative w-full aspect-video rounded overflow-hidden">
                                                    <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-600">Klik untuk memilih file</p>
                                                    <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP max 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/jpeg, image/png, image/webp" 
                                            onChange={handleFileChange} 
                                        />
                                    </div>
                                    
                                    {/* Right: Metadata */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="judul">Judul Foto</Label>
                                            <Input id="judul" required value={judul} onChange={(e) => setJudul(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="kategori">Kategori</Label>
                                            <select 
                                                id="kategori"
                                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm"
                                                required
                                                value={kategori}
                                                onChange={(e) => setKategori(e.target.value)}
                                            >
                                                <option value="">Pilih Kategori</option>
                                                <option value="Kegiatan">Kegiatan</option>
                                                <option value="Sosial">Sosial</option>
                                                <option value="Keamanan">Keamanan</option>
                                                <option value="Rapat">Rapat</option>
                                                <option value="Perayaan">Perayaan</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
                                            <Textarea id="deskripsi" rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                className="w-4 h-4"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                            />
                                            <Label htmlFor="is_featured">Jadikan Foto Unggulan (Featured)</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={!file || uploading} className="min-w-[120px]">
                                        {uploading ? "Mengupload..." : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" /> Upload
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* List Galeri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Daftar Foto Galeri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8 text-slate-500">Memuat data...</p>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                                <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                                <p>Belum ada foto di galeri.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {data.map((item) => (
                                    <div key={item.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                                        <div className="aspect-square relative bg-slate-100">
                                            <Image 
                                                src={item.image_url} 
                                                alt={item.judul} 
                                                fill 
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                                                    <Trash className="w-4 h-4 mr-1" /> Hapus
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white">
                                            <p className="font-semibold text-sm truncate" title={item.judul}>{item.judul}</p>
                                            <p className="text-xs text-slate-500">{item.kategori}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
