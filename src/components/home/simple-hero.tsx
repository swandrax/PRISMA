"use client"

import { Building2 } from "lucide-react"

export function SimpleHero() {
    return (
        <section className="bg-primary/5 py-12 md:py-16 text-center border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                    Layanan Warga RT 04
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Urus keperluan RT, lihat informasi warga, cek keuangan, dan laporkan masalah dengan mudah.
                </p>
            </div>
        </section>
    )
}
