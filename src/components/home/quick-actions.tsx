"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Wallet, AlertTriangle, CalendarDays, MessageCircle } from "lucide-react"

const actions = [
    {
        title: "Saya mau urus surat",
        icon: FileText,
        href: "/surat",
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        title: "Saya mau lihat uang kas",
        icon: Wallet,
        href: "/keuangan",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    {
        title: "Saya mau lapor masalah",
        icon: AlertTriangle,
        href: "/surat/keamanan",
        color: "text-red-600",
        bg: "bg-red-100",
    },
    {
        title: "Saya mau lihat kegiatan",
        icon: CalendarDays,
        href: "/#jadwal",
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
    {
        title: "Saya mau hubungi pengurus",
        icon: MessageCircle,
        href: "https://wa.me/6287872004448?text=Halo%20Pengurus%20RT%2004,%0A%0ASaya%20ingin%20mengajukan%20pertanyaan.%0ANama:%20%0AKeperluan:%20",
        color: "text-green-600",
        bg: "bg-green-100",
    },
]

export function QuickActions() {
    return (
        <section className="py-8 bg-background border-b border-border/50">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
                    Apa yang ingin Anda lakukan?
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {actions.map((action, i) => (
                        <Link key={i} href={action.href} className="block group">
                            <Card className="border shadow-sm hover:shadow-md transition-all h-full hover:border-primary/50 py-2">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${action.bg}`}>
                                        <action.icon className={`w-6 h-6 ${action.color}`} />
                                    </div>
                                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg md:text-base">
                                        {action.title}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
