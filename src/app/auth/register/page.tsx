"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, MapPin, Loader2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            // In a real app, you would validate and store the data here
            router.push("/auth/login")
        }, 1500)
    }

    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-blue-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-8 w-8 rounded-lg bg-white/20 mr-2 flex items-center justify-center font-bold">P</div>
                    PRISMA RT 04
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Platform ini sangat membantu saya dalam mengurus surat-surat administrasi tanpa harus bolak-balik ke rumah Pak RT.&rdquo;
                        </p>
                        <footer className="text-sm">Bapak Budi Santoso</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Buat Akun Warga</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukan data diri Anda untuk mendaftar layanan PRISMA
                        </p>
                    </div>

                    <Card>
                        <form onSubmit={onSubmit}>
                            <CardHeader>
                                <CardTitle>Registrasi</CardTitle>
                                <CardDescription>Lengkapi formulir di bawah ini</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="name" placeholder="Nama sesuai KTP" className="pl-9" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" placeholder="08xxxxxxxxxx" type="tel" className="pl-9" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Alamat Domisili</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="address" placeholder="Gg. Bugis No..." className="pl-9" required />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" required />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Daftar Sekarang
                                </Button>
                                <p className="px-8 text-center text-sm text-muted-foreground">
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
