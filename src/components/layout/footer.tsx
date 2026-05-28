import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-card/50 backdrop-blur-sm">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                P
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                PRISMA RT 04
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            Platform Realisasi Informasi, Sistem Manajemen & Administrasi.
                            Inisiatif digital warga RT 04/RW 09 Kemayoran untuk lingkungan yang guyub, transparan, dan aman.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Sistem aktif 24/7</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">
                            Layanan Digital
                        </h4>
                        <nav className="space-y-2.5" aria-label="Footer navigation - Layanan Digital">
                            <Link href="/layanan" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Semua Layanan
                            </Link>
                            <Link href="/surat" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Surat Menyurat
                            </Link>
                            <Link href="/keuangan/laporan" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Laporan Keuangan
                            </Link>
                            <Link href="/surat/keamanan" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Lapor Keamanan
                            </Link>
                            <Link href="/layanan/administrasi" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Data Administrasi
                            </Link>
                        </nav>
                    </div>

                    {/* Information Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">
                            Informasi
                        </h4>
                        <nav className="space-y-2.5" aria-label="Footer navigation - Informasi">
                            <Link href="/#pengumuman" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Pengumuman
                            </Link>
                            <Link href="/#jadwal" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Jadwal Kegiatan
                            </Link>
                            <Link href="/#pengurus" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Pengurus RT
                            </Link>
                            <Link href="/#panduan-warga" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Panduan Warga Baru
                            </Link>
                            <Link href="/#about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                                Tentang PRISMA
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">
                            Kontak
                        </h4>
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/6287872004448"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-green-500 transition-colors group"
                            >
                                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <span className="block">+62 878-7200-4448</span>
                                    <span className="text-xs opacity-70">WhatsApp 24 jam</span>
                                </div>
                            </a>
                            <a
                                href="https://t.me/mayoran04Bot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors group"
                            >
                                <svg
                                    className="h-4 w-4 mt-0.5 shrink-0 fill-current"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
                                </svg>
                                <div>
                                    <span className="block">@mayoran04Bot</span>
                                    <span className="text-xs opacity-70">Layanan Otomatis 24 Jam</span>
                                </div>
                            </a>
                            <a
                                href="mailto:rerryadusundaru12@gmail.com"
                                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>Kirim Email</span>
                            </a>
                            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Kemayoran, Jakarta Pusat</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 shrink-0" />
                                <span>Pelayanan: 08.00 - 20.00 WIB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left flex items-center gap-1.5 flex-wrap justify-center">
                        &copy; {currentYear} PRISMA RT 04 Kemayoran.
                        <span className="hidden sm:inline">Dibuat</span>
                        <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 hidden sm:outline" />
                        <span className="hidden sm:inline">oleh Bang Dika</span>
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/#about" className="hover:text-primary transition-colors">
                            Tentang
                        </Link>
                        <Link href="/#contact" className="hover:text-primary transition-colors">
                            Kontak
                        </Link>
                        <span className="text-border">|</span>
                        <span className="text-xs text-muted-foreground/60">
                            v1.0
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
