"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import {
    Camera,
    ChevronRight,
    X,
    ChevronLeft,
    Calendar,
    MapPin,
    Users,
    Maximize2,
} from "lucide-react"

export interface GalleryItem {
    id: string
    src: string
    title: string
    caption: string
    date: string
    location: string
    category: "kerja-bakti" | "rapat" | "kesehatan" | "perayaan" | "keamanan" | "sosial"
    participants?: number
}

export const galleryData: GalleryItem[] = [
    {
        id: "g1",
        src: "/gallery/mendengarkan-aspirasi-warga-berbeda-rt.jpeg",
        title: "Mendengarkan Aspirasi Warga Berbeda RT",
        caption: "Pengurus RT menyerap langsung aspirasi dari warga lintas RT.",
        date: "2026-01-15",
        location: "RW 09 Kemayoran",
        category: "sosial",
    },
    {
        id: "g2",
        src: "/gallery/musyawarah-bersama-ketua-rw09.jpeg",
        title: "Musyawarah Bersama Ketua RW 09",
        caption: "Koordinasi pengurus RT dengan Ketua RW 09 di balai warga.",
        date: "2026-02-05",
        location: "Balai Warga RW 09",
        category: "rapat",
        participants: 25,
    },
    {
        id: "g3",
        src: "/gallery/pak-erry-nominasi-kebersihan.jpeg",
        title: "Nominasi Kebersihan Lingkungan",
        caption: "Pak Erry memenangkan nominasi kebersihan dan tata letak lingkungan.",
        date: "2026-01-28",
        location: "Kelurahan Kemayoran",
        category: "perayaan",
    },
    {
        id: "g4",
        src: "/gallery/piket-rutin-ramadhan.jpeg",
        title: "Piket Rutin Bulan Ramadhan",
        caption: "Warga menjalankan piket keamanan lingkungan selama Ramadhan.",
        date: "2026-03-01",
        location: "Pos RT 04 Kemayoran",
        category: "keamanan",
        participants: 10,
    },
    {
        id: "g5",
        src: "/gallery/rapat-antar-ketua-rt-rw09.jpeg",
        title: "Rapat Antar Ketua RT RW 09",
        caption: "Forum koordinasi ketua RT se-wilayah RW 09.",
        date: "2026-02-10",
        location: "Sekretariat RW 09",
        category: "rapat",
        participants: 15,
    },
]

const categoryLabels: Record<GalleryItem["category"], { label: string; color: string }> = {
    "kerja-bakti": { label: "Kerja Bakti", color: "bg-emerald-500" },
    "rapat": { label: "Rapat", color: "bg-blue-500" },
    "kesehatan": { label: "Kesehatan", color: "bg-pink-500" },
    "perayaan": { label: "Perayaan", color: "bg-amber-500" },
    "keamanan": { label: "Keamanan", color: "bg-red-500" },
    "sosial": { label: "Sosial", color: "bg-purple-500" },
}

function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "long", year: "numeric",
    }).format(new Date(dateStr))
}

export function GalleryShowcase() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const previewItems = galleryData.slice(0, 6)

    const openLightbox = (index: number) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)

    const goNext = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % previewItems.length)
        }
    }

    const goPrev = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + previewItems.length) % previewItems.length)
        }
    }

    return (
        <section id="galeri" className="py-16 bg-muted/20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-10"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4 ring-1 ring-violet-500/20">
                        <Camera className="w-4 h-4" />
                        Dokumentasi Kegiatan
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Galeri Kegiatan RT 04
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Momen-momen kebersamaan warga RT 04 Kemayoran dalam berbagai kegiatan lingkungan.
                    </p>
                </motion.div>

                {/* Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                    {previewItems.map((item, index) => {
                        const cat = categoryLabels[item.category]
                        return (
                            <motion.div
                                key={item.id}
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 120, damping: 14 },
                                    },
                                }}
                            >
                                <Card
                                    className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-border/50"
                                    onClick={() => openLightbox(index)}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <Image
                                            src={item.src}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${cat.color} shadow-lg`}>
                                                {cat.label}
                                            </span>
                                        </div>

                                        {/* Expand Icon */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white">
                                                <Maximize2 className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Title overlay on hover */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h3 className="text-white font-bold text-lg drop-shadow-lg">{item.title}</h3>
                                        </div>
                                    </div>

                                    {/* Caption */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                                            {item.caption}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(item.date)}
                                            </span>
                                            {item.participants && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {item.participants} peserta
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-8"
                >
                    <Link href="/galeri">
                        <Button variant="outline" size="lg" className="rounded-full px-6 group">
                            Lihat Semua Galeri
                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >
                        {/* Close */}
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            onClick={closeLightbox}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Prev */}
                        <button
                            className="absolute left-2 md:left-6 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); goPrev() }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Next */}
                        <button
                            className="absolute right-2 md:right-6 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); goNext() }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Content */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative w-full max-w-4xl mx-4 md:mx-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-2xl">
                                <Image
                                    src={previewItems[lightboxIndex].src}
                                    alt={previewItems[lightboxIndex].title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 80vw"
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Caption Panel */}
                            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 text-white">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h3 className="text-xl md:text-2xl font-bold">
                                        {previewItems[lightboxIndex].title}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${categoryLabels[previewItems[lightboxIndex].category].color} shrink-0`}>
                                        {categoryLabels[previewItems[lightboxIndex].category].label}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-3">
                                    {previewItems[lightboxIndex].caption}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(previewItems[lightboxIndex].date)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {previewItems[lightboxIndex].location}
                                    </span>
                                    {previewItems[lightboxIndex].participants && (
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {previewItems[lightboxIndex].participants} peserta
                                        </span>
                                    )}
                                </div>
                                {/* Counter */}
                                <div className="mt-3 text-center text-white/40 text-xs">
                                    {lightboxIndex + 1} / {previewItems.length}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
