"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, X, Bell, User, ChevronDown, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
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
    const { user, isAuthenticated: isLoggedIn, signOut } = useAuth()
    const userName = user?.nama || "Warga"
    const userPhoto = user?.avatarUrl || null



    const handleLogout = async () => {
        await signOut()
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
                        <Link href="/surat" className="text-sm font-medium transition-colors hover:text-primary">
                            Layanan
                        </Link>
                        <Link href="/keuangan/laporan" className="text-sm font-medium transition-colors hover:text-primary">
                            Keuangan
                        </Link>
                        <Link href="/#jadwal" className="text-sm font-medium transition-colors hover:text-primary">
                            Kegiatan
                        </Link>
                        <Link href="https://wa.me/6287872004448" className="text-sm font-medium transition-colors hover:text-primary">
                            Bantuan
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
                                            <Image src={userPhoto} alt="Profile" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
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
                                    Masuk
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

                            <Link
                                href="/surat"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Layanan
                            </Link>

                            <Link
                                href="/keuangan/laporan"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Keuangan
                            </Link>

                            <Link
                                href="https://wa.me/6287872004448"
                                className="text-sm font-medium hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Bantuan
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
