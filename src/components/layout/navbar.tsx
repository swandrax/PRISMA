"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Bell, User, ChevronDown, FileText, BarChart3, ShieldAlert, ShieldCheck, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { secureStorage } from "@/lib/security"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    const [userName, setUserName] = React.useState("")
    const [userPhoto, setUserPhoto] = React.useState<string | null>(null)

    // Check login status on mount
    React.useEffect(() => {
        const checkLogin = () => {
            const loggedIn = localStorage.getItem('warga_logged_in') === 'true'
            
            // Safe decryption of profile using secureStorage helper
            const profile = secureStorage.get<any>('warga_profile')
            const photo = secureStorage.get<string>('warga_photo') || localStorage.getItem('warga_photo')

            if (loggedIn && profile) {
                setIsLoggedIn(true)
                setUserName(profile.nama || 'Warga')
            } else {
                setIsLoggedIn(false)
                setUserName("")
            }

            if (photo) {
                setUserPhoto(photo)
            } else {
                setUserPhoto(null)
            }
        }

        checkLogin()
        // Listen for storage changes
        window.addEventListener('storage', checkLogin)
        return () => window.removeEventListener('storage', checkLogin)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('warga_logged_in')
        localStorage.removeItem('warga_profile')
        localStorage.removeItem('warga_photo')
        secureStorage.remove('warga_profile')
        secureStorage.remove('warga_photo')
        setIsLoggedIn(false)
        setUserName("")
        setUserPhoto(null)
        router.push('/auth/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                                P
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                PRISMA RT 04
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                            Beranda
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger id="radix-id-1" className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                                Layanan Digital <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href="/layanan" className="flex items-center gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4" />
                                        <span>Semua Layanan</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/surat" className="flex items-center gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4" />
                                        <span>Surat Menyurat</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/keuangan/laporan" className="flex items-center gap-2 cursor-pointer">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Laporan Keuangan</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger id="radix-id-2" className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary outline-none">
                                Respons & Keamanan <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href="/surat/keamanan" className="flex items-center gap-2 cursor-pointer">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>Lapor Keamanan</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/layanan/administrasi" className="flex items-center gap-2 cursor-pointer">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Data Warga</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="#about" className="text-sm font-medium transition-colors hover:text-primary">
                            Tentang Kami
                        </Link>


                    </div>

                    {/* Utility Area */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                        <ThemeToggle />

                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        {userPhoto ? (
                                            <img src={userPhoto} alt="Profile" className="h-5 w-5 rounded-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                        <span className="max-w-[100px] truncate">{userName}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                            <User className="h-4 w-4" />
                                            <span>Profil Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                            <Settings className="h-4 w-4" />
                                            <span>Pengaturan</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500">
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button size="sm" className="gap-2" asChild>
                                <Link href="/auth/login">
                                    <User className="h-4 w-4" />
                                    Login Warga
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Navigation Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className="md:hidden border-t py-4">
                        <div className="flex flex-col space-y-4 px-2">
                            <Link
                                href="/"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Beranda
                            </Link>



                            <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                <div className="text-sm font-semibold text-muted-foreground">Layanan Digital</div>
                                <Link
                                    href="/layanan"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Semua Layanan
                                </Link>
                                <Link
                                    href="/surat"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Surat Menyurat
                                </Link>
                                <Link
                                    href="/keuangan/laporan"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Laporan Keuangan
                                </Link>
                            </div>

                            <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                <div className="text-sm font-semibold text-muted-foreground">Respons & Keamanan</div>
                                <Link
                                    href="/surat/keamanan"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Lapor Keamanan
                                </Link>
                                <Link
                                    href="/layanan/administrasi"
                                    className="block text-sm hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Data Warga
                                </Link>
                            </div>

                            <Link
                                href="#about"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Tentang Kami
                            </Link>

                            <div className="pt-4 flex items-center justify-between border-t mt-2">
                                <ThemeToggle />
                                {isLoggedIn ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="gap-2" asChild>
                                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                                                <User className="h-4 w-4" />
                                                Profil
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="destructive" className="gap-2" onClick={handleLogout}>
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" className="gap-2" asChild>
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                            <User className="h-4 w-4" />
                                            Login Warga
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
