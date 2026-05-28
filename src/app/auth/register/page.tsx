"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, MapPin, Loader2, Mail, Lock, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { signUpAdmin, signUpPengurus, signUpWarga } from "@/lib/supabase-auth"
import { validateEmailFormat } from "@/lib/security"

type Role = 'warga' | 'pengurus' | 'admin'

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedRole, setSelectedRole] = React.useState<Role>('warga')
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)
        setIsLoading(true)

        const form = event.target as HTMLFormElement
        const name = (form.elements.namedItem('name') as HTMLInputElement).value
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value
        const address = (form.elements.namedItem('address') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        // Email validation
        if (!validateEmailFormat(email)) {
            setErrorMsg("Format email tidak valid atau domain diblokir.")
            setIsLoading(false)
            return
        }

        // Simple validation
        if (password.length < 6) {
            setErrorMsg("Password minimal 6 karakter.")
            setIsLoading(false)
            return
        }

        const metadata = {
            nama: name,
            noTelepon: phone,
            alamat: address,
        }

        let result;
        if (selectedRole === 'admin') {
            result = await signUpAdmin(email, password, metadata)
        } else if (selectedRole === 'pengurus') {
            result = await signUpPengurus(email, password, metadata)
        } else {
            result = await signUpWarga(email, password, metadata)
        }

        setIsLoading(false)

        if (result.success) {
            setSuccessMsg("Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun.")
            form.reset()
            // Redirect after 3.5 seconds
            setTimeout(() => {
                router.push("/auth/login")
            }, 3500)
        } else {
            setErrorMsg(result.error || "Pendaftaran gagal. Silakan coba lagi.")
        }
    }

    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Branding */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-10 w-10 rounded-xl bg-white/20 mr-3 flex items-center justify-center font-bold text-xl backdrop-blur-sm">P</div>
                    PRISMA RT 04
                </div>
                
                {/* Feature List */}
                <div className="relative z-20 mt-auto space-y-4">
                    <h3 className="text-lg font-semibold opacity-90">Keuntungan Menjadi Anggota Digital:</h3>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Mengurus Surat Pengantar secara Online 24 Jam
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Memantau Transparansi Kas Keuangan RT secara Real-time
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Melaporkan Gangguan Keamanan Terintegrasi
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Menerima Pengumuman RT Penting via Notifikasi & WhatsApp
                        </li>
                    </ul>
                    
                    <blockquote className="border-l-2 border-white/30 pl-4 mt-6">
                        <p className="text-base italic opacity-90">
                            &ldquo;Platform ini sangat membantu saya dalam mengurus surat-surat administrasi tanpa harus bolak-balik ke rumah Pak RT.&rdquo;
                        </p>
                        <footer className="text-sm opacity-70 mt-2">— Bapak Budi Santoso (Warga RT 04)</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="lg:p-8 p-4">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Buat Akun Warga</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukan data diri Anda untuk mendaftar layanan PRISMA
                        </p>
                    </div>

                    <Card className="border-2">
                        <form onSubmit={onSubmit}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span>Registrasi</span>
                                </CardTitle>
                                <CardDescription>Lengkapi formulir di bawah ini</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {errorMsg && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {errorMsg}
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                        {successMsg}
                                    </div>
                                )}

                                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                                    <div className="flex items-start gap-2">
                                        <Shield className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block mb-0.5">Dukungan Email Pribadi & Keamanan Data</span>
                                            Warga RT 04 dapat mendaftar menggunakan email pribadi seperti <strong className="font-medium text-blue-800 dark:text-blue-200">@gmail.com</strong>. Seluruh data Anda dienkripsi penuh di browser (AES-256-GCM) sebelum dikirimkan ke server.
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Mendaftar Sebagai</Label>
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button"
                                            variant={selectedRole === 'warga' ? 'default' : 'outline'} 
                                            onClick={() => setSelectedRole('warga')}
                                            className="flex-1"
                                        >
                                            Warga
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant={selectedRole === 'pengurus' ? 'default' : 'outline'} 
                                            onClick={() => setSelectedRole('pengurus')}
                                            className="flex-1"
                                        >
                                            Pengurus
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant={selectedRole === 'admin' ? 'default' : 'outline'} 
                                            onClick={() => setSelectedRole('admin')}
                                            className="flex-1"
                                        >
                                            Admin
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap (sesuai KTP)</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="name" name="name" placeholder="Nama Lengkap Anda" className="pl-10" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" name="email" type="email" placeholder="warga.rt04@gmail.com" className="pl-10" required />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
                                        <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        Email pribadi (@gmail.com dll.) didukung penuh & dilindungi enkripsi AES-256.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" type="tel" className="pl-10" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Alamat Domisili</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="address" name="address" placeholder="Gg. Bugis No..." className="pl-10" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password (min. 6 karakter)</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="password" name="password" type="password" className="pl-10" required />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full" disabled={isLoading || !!successMsg}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {successMsg ? "Berhasil Mendaftar!" : "Daftar Sekarang"}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{" "}
                                    <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                                        Login disini
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
