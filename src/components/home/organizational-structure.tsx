"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Phone,
    Crown,
    BookOpen,
    Wallet,
    Users,
    ChevronRight,
    Lightbulb
} from "lucide-react"

interface OfficialMember {
    name: string
    role: string
    roleId: string
    icon: React.ComponentType<{ className?: string }>
    phone: string
    description: string
    gradient: string
    accent: string
}

const officials: OfficialMember[] = [
    {
        name: "Bapak R Erry Adu Sundaru",
        role: "Ketua RT 04",
        roleId: "ketua",
        icon: Crown,
        phone: "",
        description: "Koordinator utama kegiatan dan kebijakan RT 04. Bertanggung jawab atas keamanan dan kesejahteraan warga.",
        gradient: "from-blue-600 to-indigo-700",
        accent: "ring-blue-500/30",
    },
    {
        name: "Ibu Melly Nainggolan",
        role: "Sekretaris",
        roleId: "sekretaris",
        icon: BookOpen,
        phone: "",
        description: "Menangani administrasi surat-menyurat, pencatatan data warga, dan dokumentasi kegiatan RT.",
        gradient: "from-emerald-600 to-teal-700",
        accent: "ring-emerald-500/30",
    },
    {
        name: "Ibu Retno Fellyanti",
        role: "Bendahara",
        roleId: "bendahara",
        icon: Wallet,
        phone: "",
        description: "Mengelola keuangan RT meliputi iuran warga, pengeluaran operasional, dan pelaporan transparan.",
        gradient: "from-amber-600 to-orange-700",
        accent: "ring-amber-500/30",
    },
    {
        name: "Bpk. Dika",
        role: "Programmer & Technical Engineer",
        roleId: "rnd",
        icon: Lightbulb,
        phone: "6287782380077",
        description: "Bertanggung jawab atas riset, inovasi, pengembangan program lingkungan, serta penanganan CCTV.",
        gradient: "from-purple-600 to-fuchsia-700",
        accent: "ring-purple-500/30",
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
}

const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100, damping: 14 }
    }
}

export function OrganizationalStructure() {
    const openWhatsApp = (phone: string, name: string) => {
        const msg = encodeURIComponent(`Halo ${name}, saya warga RT 04. Saya ingin bertanya mengenai...`)
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer')
    }

    return (
        <section id="pengurus" className="py-16 bg-background relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 ring-1 ring-primary/20">
                        <Users className="w-4 h-4" />
                        Struktur Organisasi
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Pengurus RT 04 Kemayoran
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Kenali pengurus RT yang siap melayani dan menjaga lingkungan kita.
                    </p>
                </motion.div>

                {/* Officials Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {officials.map((official) => {
                        const Icon = official.icon
                        return (
                            <motion.div key={official.roleId} variants={cardVariants}>
                                <Card className={`group h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border bg-card ring-1 ${official.accent}`}>
                                    <CardContent className="p-0 flex flex-col h-full">
                                        {/* Top gradient banner with icon */}
                                        <div className={`bg-gradient-to-br ${official.gradient} p-6 text-white relative`}>
                                            <div className="absolute top-3 right-3 opacity-10 text-6xl font-black select-none pointer-events-none">
                                                <Icon className="h-16 w-16" />
                                            </div>
                                            {/* Avatar placeholder */}
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 ring-2 ring-white/40 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight">{official.name}</h3>
                                            <p className="text-white/80 text-sm font-medium mt-0.5">{official.role}</p>
                                        </div>

                                        {/* Description */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                                {official.description}
                                            </p>

                                            {/* WhatsApp CTA */}
                                            <div className="mt-4 pt-4 border-t border-dashed border-border/50">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 group/btn transition-all duration-200 active:scale-95"
                                                    onClick={() => openWhatsApp(official.phone, official.role)}
                                                >
                                                    <Phone className="h-4 w-4" />
                                                    <span>Hubungi via WhatsApp</span>
                                                    <ChevronRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}
