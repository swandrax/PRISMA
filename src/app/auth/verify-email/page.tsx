"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, KeyRound, Loader2, ArrowLeft, CheckCircle, AlertCircle, Copy, Check, Mail, Code, Eye } from "lucide-react"

export default function VerifyEmailPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
    const [timeLeft, setTimeLeft] = React.useState(600) // 10 minutes (600 seconds)
    const [activeTab, setActiveTab] = React.useState<"verify" | "template">("verify")
    const [isCopied, setIsCopied] = React.useState(false)

    // References for auto-focusing OTP inputs
    const inputRefs = [
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
    ]

    // Countdown timer
    React.useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return // Allow digits only

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        setErrorMsg(null)

        // Auto focus next input
        if (value !== "" && index < 5) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
    }

    async function onVerify(event: React.SyntheticEvent) {
        event.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        const code = otp.join("")
        if (code.length < 6) {
            setErrorMsg("Silakan masukkan 6 digit kode verifikasi lengkap.")
            return
        }

        setIsLoading(true)

        // Simulate OTP verification process
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsLoading(false)

        if (code === "990754") { // Match OTP from Zavora reference for demonstration
            setSuccessMsg("Email Anda berhasil diverifikasi! Akun warga Anda kini telah aktif.")
            setTimeout(() => {
                router.push("/profile")
            }, 3000)
        } else {
            setErrorMsg("Kode verifikasi salah atau kedaluwarsa. Silakan periksa kembali email Anda.")
        }
    }

    // Modern Responsive PRISMA-Style HTML Email Template
    const emailHtmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi Email - PRISMA RT 04</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 10px;">
        <tr>
            <td align="center">
                <!-- Outer Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
                    
                    <!-- Gradient Header (PRISMA Ecosystem Blue/Indigo) -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%); padding: 32px 40px; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 10px 14px; font-weight: 800; font-size: 20px; color: #ffffff; letter-spacing: 1px; backdrop-filter: blur(8px);">
                                            PRISMA RT 04
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #93c5fd; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; padding-top: 16px;">
                                        Sistem Informasi Manajemen Warga
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px;">
                            <p style="font-size: 16px; line-height: 24px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                                Halo, Tetangga Swandaru Tirta!
                            </p>
                            <p style="font-size: 15px; line-height: 24px; color: #475569; margin-top: 0; margin-bottom: 24px;">
                                Terima kasih telah melakukan registrasi pada Portal Digital PRISMA RT 04. Gunakan kode verifikasi di bawah ini untuk mengonfirmasi alamat email Anda dan mengaktifkan akses warga Anda:
                            </p>
                            
                            <!-- OTP Display Box in PRISMA Blue style -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center" style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px 20px;">
                                        <div style="font-size: 36px; font-weight: 800; color: #1e3a8a; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; margin-bottom: 4px;">
                                            990754
                                        </div>
                                        <div style="font-size: 12px; color: #60a5fa; font-weight: 500;">
                                            Kode ini berlaku selama 10 menit
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="font-size: 14px; line-height: 20px; color: #64748b; margin-top: 0; margin-bottom: 24px; text-align: center;">
                                Masukkan kode di atas pada halaman verifikasi pendaftaran untuk menyelesaikan aktivasi akun Anda.
                            </p>
                            
                            <!-- Safety Warning Alert in Amber (PRISMA Ecosystem Guard) -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 10px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="font-size: 13px; line-height: 20px; color: #b45309; font-weight: 500; margin: 0;">
                                            <strong>⚠️ PERINGATAN KEAMANAN:</strong> Jika Anda tidak merasa mendaftar di Portal PRISMA RT 04 Kemayoran, abaikan email ini secara aman. Jangan bagikan kode ini kepada siapapun, termasuk yang mengaku sebagai pengurus RT.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Email Footer -->
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0 0 4px 0;">
                                &copy; 2026 PRISMA RT 04 Kemayoran. Hak Cipta Dilindungi.
                            </p>
                            <p style="font-size: 11px; line-height: 16px; color: #cbd5e1; margin: 0;">
                                Email ini dikirim secara otomatis oleh sistem, mohon untuk tidak membalas email ini.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailHtmlTemplate)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel: Branding & Ecosystem Details */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-10 w-10 rounded-xl bg-white/20 mr-3 flex items-center justify-center font-bold text-xl backdrop-blur-sm">P</div>
                    PRISMA RT 04
                </div>
                
                <div className="relative z-20 mt-auto space-y-6">
                    <h3 className="text-xl font-bold">Standardisasi Ekosistem Notifikasi PRISMA</h3>
                    <p className="text-sm opacity-85 leading-relaxed">
                        Kami telah mengganti desain verifikasi email lama yang kaku menjadi template verifikasi adaptif yang modern. Mengambil inspirasi dari alur kode OTP Zavora, namun sepenuhnya disesuaikan dengan skema warna biru-indigo dan estetika premium PRISMA.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <h4 className="text-xs font-semibold text-blue-300 mb-1">🔐 Data Terenkripsi</h4>
                            <p className="text-[11px] opacity-75">Diuji dengan standar OWASP tingkat tinggi untuk proteksi warga.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <h4 className="text-xs font-semibold text-blue-300 mb-1">📱 Responsif Penuh</h4>
                            <p className="text-[11px] opacity-75">Ditampilkan secara elegan baik di Gmail seluler maupun desktop.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Interactive Area */}
            <div className="lg:p-8 p-4 flex flex-col items-center justify-center min-h-screen">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px]">
                    
                    {/* Header Tabs for Interactive Experience */}
                    <div className="flex bg-muted rounded-xl p-1 gap-1 border border-border">
                        <Button 
                            variant={activeTab === "verify" ? "default" : "ghost"}
                            className="flex-1 rounded-lg gap-2 text-xs h-9"
                            onClick={() => setActiveTab("verify")}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Simulasi Halaman Verifikasi</span>
                        </Button>
                        <Button 
                            variant={activeTab === "template" ? "default" : "ghost"}
                            className="flex-1 rounded-lg gap-2 text-xs h-9"
                            onClick={() => setActiveTab("template")}
                        >
                            <Code className="h-3.5 w-3.5" />
                            <span>Lihat Template Email PRISMA</span>
                        </Button>
                    </div>

                    {activeTab === "verify" ? (
                        <Card className="border-2 shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Link href="/auth/register" className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="h-3 w-3" />
                                        Kembali
                                    </Link>
                                    <div className="flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                                        <Shield className="h-3 w-3" />
                                        <span>Secure</span>
                                    </div>
                                </div>
                                <CardTitle className="flex items-center gap-2 mt-4">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                    <span>Masukkan Kode OTP</span>
                                </CardTitle>
                                <CardDescription>Kami telah mengirimkan 6 digit kode OTP verifikasi ke email Anda.</CardDescription>
                            </CardHeader>
                            <form onSubmit={onVerify}>
                                <CardContent className="grid gap-6">
                                    {errorMsg && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <span>{errorMsg}</span>
                                        </div>
                                    )}

                                    {successMsg && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                            <span>{successMsg}</span>
                                        </div>
                                    )}

                                    {/* 6 Digit OTP Inputs */}
                                    <div className="grid gap-2 text-center">
                                        <Label className="text-xs text-muted-foreground mb-1">Kode Verifikasi (Gunakan kode: <strong>990754</strong>)</Label>
                                        <div className="flex justify-between gap-2 max-w-[340px] mx-auto w-full">
                                            {otp.map((digit, idx) => (
                                                <Input
                                                    key={idx}
                                                    ref={inputRefs[idx]}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                                    className="w-12 h-12 text-center text-xl font-bold bg-muted/30 focus-visible:ring-primary border-2 rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Expiry Countdown & Resend Option */}
                                    <div className="text-center text-xs">
                                        <p className="text-muted-foreground">
                                            Kode kedaluwarsa dalam: <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
                                        </p>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-xs p-0 h-auto mt-2"
                                            disabled={timeLeft > 0}
                                            onClick={() => setTimeLeft(600)}
                                        >
                                            Kirim Ulang Kode OTP
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3">
                                    <Button className="w-full" disabled={isLoading || !!successMsg}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {successMsg ? "Berhasil Diverifikasi!" : "Verifikasi Sekarang"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    ) : (
                        <Card className="border-2 shadow-lg transition-all duration-300 max-h-[75vh] flex flex-col">
                            <CardHeader className="flex-shrink-0 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-1.5">
                                            <Mail className="h-4.5 w-4.5 text-primary" />
                                            <span>Notifikasi Verifikasi PRISMA</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs">HTML email siap pakai di Gmail / SMTP</CardDescription>
                                    </div>
                                    <Button 
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>Tersalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Salin HTML</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-y-auto p-4 bg-slate-50 dark:bg-zinc-950 flex-1">
                                {/* Visual Render of the Email Template (Design Ecosystem of PRISMA) */}
                                <div className="w-full max-w-[420px] mx-auto bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden shadow-md text-slate-800 dark:text-slate-200">
                                    
                                    {/* Email Header */}
                                    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 text-center text-white">
                                        <div className="inline-block bg-white/15 px-3 py-1.5 rounded-lg text-sm font-extrabold tracking-wide backdrop-blur-sm">
                                            PRISMA RT 04
                                        </div>
                                        <p className="text-[10px] text-blue-300 tracking-wider font-semibold uppercase mt-3">
                                            SISTEM INFORMASI MANAJEMEN WARGA
                                        </p>
                                    </div>

                                    {/* Email Content Body */}
                                    <div className="p-6 text-xs space-y-4">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                                            Halo, Tetangga Swandaru Tirta!
                                        </p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Terima kasih telah melakukan registrasi pada Portal Digital PRISMA RT 04. Gunakan kode verifikasi di bawah ini untuk mengonfirmasi alamat email Anda dan mengaktifkan akses warga Anda:
                                        </p>

                                        {/* OTP Dotted Box in PRISMA style */}
                                        <div className="bg-blue-50/50 dark:bg-blue-950/20 border-2 border-dashed border-blue-500/50 rounded-xl p-5 text-center">
                                            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 tracking-[6px] font-mono">
                                                990754
                                            </div>
                                            <div className="text-[10px] text-blue-400 font-semibold mt-1">
                                                Kode ini berlaku selama 10 menit
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-center text-muted-foreground">
                                            Masukkan kode di atas pada halaman verifikasi pendaftaran untuk menyelesaikan aktivasi akun Anda.
                                        </p>

                                        {/* Warning Box in Amber */}
                                        <div className="bg-amber-50/60 dark:bg-amber-950/10 border-l-4 border-amber-500 p-3.5 rounded">
                                            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-normal">
                                                <strong>⚠️ PERINGATAN KEAMANAN:</strong> Jika Anda tidak merasa mendaftar di Portal PRISMA RT 04 Kemayoran, abaikan email ini. Jangan bagikan kode ini kepada siapapun.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Footer */}
                                    <div className="bg-slate-50 dark:bg-zinc-800/40 border-t p-4 text-center text-[10px] text-muted-foreground">
                                        <p>&copy; 2026 PRISMA RT 04 Kemayoran. Hak Cipta Dilindungi.</p>
                                        <p className="text-[9px] opacity-75 mt-1">Email ini dikirim secara otomatis oleh sistem.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    )
}
