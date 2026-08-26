"use client"

import Link from "next/link"
import { Home, Search, FileQuestion, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NotFound() {
    const quickLinks = [
        { title: "Beranda", href: "/", icon: Home },
        { title: "Layanan Digital", href: "/layanan", icon: Search },
        { title: "Laporan Keuangan", href: "/keuangan/laporan", icon: FileQuestion },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 relative">
                        <div className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            404
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary/10 rounded-full">
                            <span className="text-xs font-medium text-primary">Page Not Found</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-foreground mt-6">
                        Halaman Tidak Ditemukan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Quick Links */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Mungkin Anda mencari:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {quickLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-foreground">{link.title}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button asChild>
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Beranda
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/search">
                                <Search className="h-4 w-4 mr-2" />
                                Cari
                            </Link>
                        </Button>
                    </div>

                    {/* Help Section */}
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                        <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-amber-700 dark:text-amber-300 font-medium">Butuh bantuan?</p>
                            <p className="text-amber-600/80 dark:text-amber-400/80 text-xs mt-1">
                                Hubungi Admin & IT RT 04 (Swandaru Tirta) di{" "}
                                <a href="https://wa.me/6287782380077" target="_blank" rel="noopener noreferrer" className="underline font-medium">0877-8238-0077</a>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
