// c:\Users\user\Desktop\prisma\src\app\galeri\page.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import {
    Camera,
    ArrowLeft,
    Calendar,
    Users,
    Maximize2,
    Filter,
} from "lucide-react"

// Lightbox imports
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

const categories = [
    { key: "all", label: "Semua" },
    { key: "Kegiatan", label: "Kegiatan", color: "bg-blue-500" },
    { key: "Sosial", label: "Sosial", color: "bg-purple-500" },
    { key: "Keamanan", label: "Keamanan", color: "bg-red-500" },
    { key: "Rapat", label: "Rapat", color: "bg-emerald-500" },
    { key: "Perayaan", label: "Perayaan", color: "bg-amber-500" },
]

const categoryColors: Record<string, string> = {
    "Kegiatan": "bg-blue-500",
    "Sosial": "bg-purple-500",
    "Keamanan": "bg-red-500",
    "Rapat": "bg-emerald-500",
    "Perayaan": "bg-amber-500",
}

function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "long", year: "numeric",
    }).format(new Date(dateStr))
}

interface GaleriItem {
    id: string;
    judul: string;
    deskripsi: string;
    kategori: string;
    tanggal: string;
    peserta_count: number;
    image_url: string;
}

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState("all")
    const [lightboxIndex, setLightboxIndex] = useState(-1)
    const [data, setData] = useState<GaleriItem[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function fetchGallery() {
            const { data: galeriData, error } = await supabase
                .from('galeri')
                .select('*')
                .order('is_featured', { ascending: false })
                .order('tanggal', { ascending: false })

            if (!error && galeriData) {
                setData(galeriData)
            }
            setLoading(false)
        }
        fetchGallery()
    }, [supabase])

    const filteredItems = activeCategory === "all"
        ? data
        : data.filter(item => item.kategori === activeCategory)

    // Slides for lightbox
    const slides = filteredItems.map(item => ({
        src: item.image_url,
        title: item.judul,
        description: item.deskripsi
    }))

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-b from-violet-500/10 to-transparent pt-8 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href="/#galeri">
                        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                            <Camera className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Galeri Kegiatan
                        </h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mt-2">
                        Dokumentasi lengkap kegiatan warga RT 04 Kemayoran. Klik foto untuk melihat detail.
                    </p>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
                        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                    activeCategory === cat.key
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    
                    {!loading && (
                        <p className="text-xs text-muted-foreground mt-3">
                            Menampilkan {filteredItems.length} foto
                        </p>
                    )}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="container mx-auto px-4 max-w-6xl pb-16">
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground">
                        Memuat galeri...
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
                        >
                            {filteredItems.map((item, index) => {
                                const catColor = categoryColors[item.kategori] || "bg-gray-500"
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="break-inside-avoid"
                                    >
                                        <Card
                                            className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-border/50"
                                            onClick={() => setLightboxIndex(index)}
                                        >
                                            <div className="relative">
                                                {/* We don't have aspect ratio here, relying on masonry layout so Image needs to be responsive.
                                                    Next.js Image requires width/height or fill. We will use an aspect container for now. 
                                                */}
                                                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.judul}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        placeholder="blur"
                                                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // simple gray blur
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${catColor} shadow-lg`}>
                                                            {item.kategori}
                                                        </span>
                                                    </div>
    
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white">
                                                            <Maximize2 className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Detail Caption */}
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                                                        {item.judul}
                                                    </h3>
                                                    {item.deskripsi && (
                                                        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                                                            {item.deskripsi}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(item.tanggal)}
                                                        </span>
                                                        {item.peserta_count > 0 && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {item.peserta_count} peserta
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Belum ada foto untuk kategori ini.</p>
                    </div>
                )}
            </div>

            <Lightbox
                open={lightboxIndex >= 0}
                close={() => setLightboxIndex(-1)}
                index={lightboxIndex}
                slides={slides}
            />
        </div>
    )
}
