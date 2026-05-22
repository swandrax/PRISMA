"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
    ChevronLeft, 
    ChevronRight, 
    BarChart3, 
    Calendar, 
    Phone, 
    Users, 
    TrendingUp, 
    ShieldCheck, 
    Camera, 
    Activity,
    Lock
} from "lucide-react"

const items = [
    {
        id: 1,
        heading: "Guyub Rukun Warga RT 04 Kemayoran",
        text: "Membangun sinergi dan kebersamaan melalui gotong royong digital dan fisik.",
        bgClass: "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
        badgeText: "Portal Warga RT 04",
        badgeClass: "text-blue-300 bg-blue-500/10 border-blue-500/20",
        primaryBtnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-950/40 border border-indigo-500/30",
        secondaryBtnClass: "border-2 border-indigo-400/50 bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-200 hover:text-white",
        tertiaryBtnClass: "border-2 border-purple-400/50 bg-purple-950/40 hover:bg-purple-950/60 text-purple-200 hover:text-white",
        dotColorClass: "bg-blue-400"
    },
    {
        id: 2,
        heading: "Transparansi dalam Genggaman",
        text: "Pantau arus kas dan ajukan surat pengantar kapan saja, di mana saja.",
        bgClass: "bg-gradient-to-br from-teal-900 via-emerald-950 to-green-950",
        badgeText: "Transparansi RT 04",
        badgeClass: "text-teal-300 bg-teal-500/10 border-teal-500/20",
        primaryBtnClass: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-950/40 border border-teal-500/30",
        secondaryBtnClass: "border-2 border-teal-400/50 bg-teal-950/40 hover:bg-teal-950/60 text-teal-200 hover:text-white",
        tertiaryBtnClass: "border-2 border-emerald-400/50 bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-200 hover:text-white",
        dotColorClass: "bg-teal-400"
    },
    {
        id: 3,
        heading: "Lingkungan Aman & Terpantau",
        text: "Integrasi sistem keamanan dan respon darurat 24 jam untuk ketenangan warga.",
        bgClass: "bg-gradient-to-br from-orange-950 via-red-950 to-rose-950",
        badgeText: "Keamanan RT 04",
        badgeClass: "text-rose-300 bg-rose-500/10 border-rose-500/20",
        primaryBtnClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/40 border border-rose-500/30",
        secondaryBtnClass: "border-2 border-rose-400/50 bg-rose-950/40 hover:bg-rose-950/60 text-rose-200 hover:text-white",
        tertiaryBtnClass: "border-2 border-orange-400/50 bg-orange-950/40 hover:bg-orange-950/60 text-orange-200 hover:text-white",
        dotColorClass: "bg-rose-400"
    },
]

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = React.useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, 8000) // 8 seconds per slide for better readability
        return () => clearInterval(timer)
    }, [])

    const next = () => setCurrentIndex((prev) => (prev + 1) % items.length)
    const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)

    // Render visual animations depending on slide index
    const renderVisualGraphic = (index: number) => {
        switch (index) {
            case 0: // Slide 1: Guyub Warga
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl overflow-hidden"
                    >
                        {/* Glowing radial back-light */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <Users className="h-4.5 w-4.5 text-blue-400" />
                                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Aktifitas Warga</span>
                            </div>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>

                        {/* Interactive Node Graph Illustration */}
                        <div className="flex-1 flex items-center justify-center relative py-6">
                            {/* Central node */}
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-sm shadow-lg text-white z-20"
                            >
                                RT 04
                            </motion.div>

                            {/* Connected pulsing node 1 */}
                            <motion.div 
                                animate={{ y: [0, -6, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute top-4 left-6 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-medium text-xs text-blue-300 backdrop-blur-sm z-10"
                            >
                                BS
                            </motion.div>

                            {/* Connected pulsing node 2 */}
                            <motion.div 
                                animate={{ x: [0, 8, 0] }}
                                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-6 right-6 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-medium text-xs text-purple-300 backdrop-blur-sm z-10"
                            >
                                DK
                            </motion.div>

                            {/* Connected pulsing node 3 */}
                            <motion.div 
                                animate={{ y: [0, 6, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-4 left-8 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-medium text-xs text-indigo-300 backdrop-blur-sm z-10"
                            >
                                RE
                            </motion.div>

                            {/* Connected pulsing node 4 */}
                            <motion.div 
                                animate={{ x: [0, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1.5 }}
                                className="absolute top-6 right-8 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-medium text-xs text-slate-300 backdrop-blur-sm z-10"
                            >
                                AN
                            </motion.div>

                            {/* Connecting SVG Lines */}
                            <svg className="absolute inset-0 w-full h-full stroke-white/15 fill-none stroke-[1.5]" style={{ pointerEvents: 'none' }}>
                                <line x1="50%" y1="50%" x2="25%" y2="20%" />
                                <line x1="50%" y1="50%" x2="80%" y2="80%" />
                                <line x1="50%" y1="50%" x2="30%" y2="80%" />
                                <line x1="50%" y1="50%" x2="75%" y2="25%" />
                            </svg>
                        </div>

                        {/* Notification Bubble at the bottom */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="bg-white/10 border border-white/15 rounded-xl p-2.5 backdrop-blur-sm flex items-center gap-2 relative z-10"
                        >
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300">💬</div>
                            <div className="text-[10px] text-slate-200">
                                <strong>Gotong Royong Mingu:</strong> Kerja bakti pukul 07:00 WIB...
                            </div>
                        </motion.div>
                    </motion.div>
                )

            case 1: // Slide 2: Transparansi Keuangan
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl overflow-hidden"
                    >
                        {/* Glowing radial back-light */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4.5 w-4.5 text-teal-400" />
                                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Kas RT Transparan</span>
                            </div>
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                                MEI 2026
                            </span>
                        </div>

                        {/* Simulated Financial Balance */}
                        <div className="flex-1 flex flex-col justify-center relative z-10 py-4 text-center">
                            <span className="text-[11px] text-teal-300 tracking-wider font-semibold uppercase">Total Saldo Kas RT</span>
                            <motion.h2 
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="text-3xl font-black text-white tracking-tight mt-1"
                            >
                                Rp 14.250.000
                            </motion.h2>
                            <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-full w-fit mx-auto border border-emerald-500/20">
                                <span>▲ +12.4% Bulan Ini</span>
                            </div>
                        </div>

                        {/* Interactive Graph Chart bars */}
                        <div className="h-16 flex items-end gap-3 px-2 relative z-10 border-t border-white/10 pt-4">
                            {[40, 75, 55, 95, 60, 85].map((val, idx) => (
                                <div key={idx} className="flex-1 bg-white/10 rounded-t h-full flex items-end overflow-hidden">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ delay: 0.7 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                                        className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )

            case 2: // Slide 3: Keamanan & CCTV
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl overflow-hidden"
                    >
                        {/* Glowing radial back-light */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4.5 w-4.5 text-red-400" />
                                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Sistem Keamanan</span>
                            </div>
                            <span className="flex items-center gap-1.5 text-[9px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                                <Activity className="h-3 w-3 animate-pulse" />
                                MONITOR AKTIF
                            </span>
                        </div>

                        {/* CCTV Simulator Graphic */}
                        <div className="flex-1 flex items-center justify-center relative py-4">
                            {/* Scanning radar circular grid */}
                            <div className="relative w-36 h-36 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                                {/* Sweep radar line */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute w-full h-full bg-gradient-to-r from-red-500/20 via-transparent to-transparent origin-center top-0 left-0"
                                />

                                <div className="absolute w-24 h-24 rounded-full border border-white/5" />
                                <div className="absolute w-12 h-12 rounded-full border border-white/5" />
                                
                                {/* Target CCTV marker */}
                                <motion.div 
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute top-8 right-10 flex flex-col items-center"
                                >
                                    <Camera className="h-4.5 w-4.5 text-red-400" />
                                    <span className="text-[7px] text-red-300 font-semibold tracking-wider mt-0.5">CAM 01</span>
                                </motion.div>
                                
                                <ShieldCheck className="h-10 w-10 text-white/45 relative z-10" />
                            </div>
                        </div>

                        {/* Guard status log */}
                        <div className="bg-black/35 rounded-xl p-2.5 border border-white/15 relative z-10 font-mono text-[9px]">
                            <div className="flex justify-between text-slate-300">
                                <span>STATUS:</span>
                                <span className="text-emerald-400 font-bold">AMAN / SAFE</span>
                            </div>
                            <div className="flex justify-between text-slate-400 mt-1">
                                <span>CCTV:</span>
                                <span>4 ONLINE / 0 ERROR</span>
                            </div>
                        </div>
                    </motion.div>
                )
            default:
                return null
        }
    }

    return (
        <div className="relative min-h-[660px] sm:min-h-[720px] md:h-[620px] w-full overflow-hidden bg-slate-950 select-none flex items-center py-12 md:py-0">
            {/* Background Slides */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 flex items-center ${items[currentIndex].bgClass}`}
                >
                    {/* Visual Overlay for contrast improvement */}
                    <div className="absolute inset-0 bg-black/45" />

                    <div className="container relative z-10 px-6 mx-auto text-white">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center justify-between">
                            
                            {/* Left column: Text Information & Buttons */}
                            <div className="col-span-1 md:col-span-7 text-center md:text-left space-y-6">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                >
                                    <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-4 backdrop-blur-sm ${items[currentIndex].badgeClass}`}>
                                        {items[currentIndex].badgeText}
                                    </span>
                                </motion.div>
                                
                                <motion.h1
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl drop-shadow-md text-white font-sans leading-tight"
                                >
                                    {items[currentIndex].heading}
                                </motion.h1>
                                
                                <motion.p
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="text-base md:text-lg opacity-85 max-w-2xl leading-relaxed text-slate-200"
                                >
                                    {items[currentIndex].text}
                                </motion.p>
                                
                                {/* Quick Action Buttons with custom-tailored background & border classes for high readability */}
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="flex flex-wrap justify-center md:justify-start gap-4 pt-2"
                                >
                                    <Button 
                                        asChild 
                                        size="lg" 
                                        variant="custom"
                                        className={`font-bold shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] active:scale-95 rounded-full px-7 ${items[currentIndex].primaryBtnClass}`}
                                    >
                                        <Link href="/keuangan/laporan">
                                            <BarChart3 className="h-4.5 w-4.5 mr-2" />
                                            Laporan Keuangan
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        asChild 
                                        size="lg" 
                                        variant="custom" 
                                        className={`font-semibold rounded-full px-7 transition-all hover:translate-y-[-2px] active:scale-95 backdrop-blur-sm ${items[currentIndex].secondaryBtnClass}`}
                                    >
                                        <Link href="/#jadwal">
                                            <Calendar className="h-4.5 w-4.5 mr-2" />
                                            Jadwal Kegiatan
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        asChild 
                                        size="lg" 
                                        variant="custom"
                                        className={`font-semibold rounded-full px-7 transition-all hover:translate-y-[-2px] active:scale-95 backdrop-blur-sm ${items[currentIndex].tertiaryBtnClass}`}
                                    >
                                        <Link href="/#contact">
                                            <Phone className="h-4.5 w-4.5 mr-2" />
                                            Hubungi RT
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Right column: Animated Visual Themed Card Graphics */}
                            <div className="col-span-1 md:col-span-5 flex justify-center items-center mt-8 md:mt-0 scale-[0.8] sm:scale-90 md:scale-100 origin-center">
                                {renderVisualGraphic(currentIndex)}
                            </div>

                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3.5 z-20">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex 
                                ? `w-8 ${items[currentIndex].dotColorClass}` 
                                : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Controls: Prev Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-20 transition-all"
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            {/* Slide Controls: Next Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 z-20 transition-all"
            >
                <ChevronRight className="h-8 w-8" />
            </Button>
        </div>
    )
}
