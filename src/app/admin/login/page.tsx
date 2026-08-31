"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReCAPTCHA from "react-google-recaptcha"
import { ShieldCheck, User, Eye, EyeOff, Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

const SITE_KEY = "6Ldva04sAAAAAHH3ovqnkrrVTsq_1zNNDMleOIaB"

export default function AdminLoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [captchaVerified, setCaptchaVerified] = React.useState(false)
    const [formData, setFormData] = React.useState({
        username: "",
        password: "",
    })

    const handleCaptchaChange = (token: string | null) => {
        if (token) {
            setCaptchaVerified(true)
        } else {
            setCaptchaVerified(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!captchaVerified) return

        setIsLoading(true)

        // Simulate API verification
        setTimeout(() => {
            setIsLoading(false)
            router.push("/admin/dashboard")
        }, 1500)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Abstract Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

                {/* Geometric Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Glass Card */}
            <div className="z-10 w-full max-w-md p-4">
                <Card className="border-white/10 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-white relative overflow-hidden">
                    {/* Top colored accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />

                    <CardHeader className="space-y-2 text-center pb-2">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg mb-2">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                            Admin Portal Login
                        </h1>
                        <p className="text-sm text-blue-100/80 font-medium">
                            Sistem Manajemen RT 04 - Restricted Access
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Username Field */}
                            <div className="space-y-2 relative group">
                                <Label htmlFor="username" className="text-blue-100 text-xs uppercase tracking-wide font-semibold ml-1">
                                    Username / Email Pengurus
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="admin@rt04.id"
                                        className="bg-slate-950/50 border-white/10 text-white placeholder:text-white/30 pl-4 pr-10 hover:border-blue-400/50 focus:border-blue-400 transition-colors h-11"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                    <User className="absolute right-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 relative group">
                                <Label htmlFor="password" className="text-blue-100 text-xs uppercase tracking-wide font-semibold ml-1">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="bg-slate-950/50 border-white/10 text-white placeholder:text-white/30 pl-4 pr-10 hover:border-blue-400/50 focus:border-blue-400 transition-colors h-11"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Extras: Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 checked:bg-blue-500 h-4 w-4 transition-all" />
                                    <span className="text-blue-100/80 group-hover:text-white transition-colors">Remember Me</span>
                                </label>
                                <Link href="#" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Captcha */}
                            <div className="flex justify-center py-2 bg-white/5 rounded-lg border border-white/5">
                                <ReCAPTCHA
                                    sitekey={SITE_KEY}
                                    onChange={handleCaptchaChange}
                                    theme="dark"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className={`w-full h-12 text-base font-semibold shadow-xl transition-all duration-300 ${captchaVerified
                                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                                        : "bg-slate-700 text-slate-400 cursor-not-allowed hover:bg-slate-700"
                                    }`}
                                disabled={!captchaVerified || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying Access...
                                    </>
                                ) : (
                                    <>
                                        {captchaVerified ? (
                                            <span>Masuk ke Dashboard</span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Verifikasi Captcha Terlebih Dahulu
                                            </span>
                                        )}
                                    </>
                                )}
                            </Button>

                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/10 pt-4">
                        <p className="text-[10px] text-center text-blue-200/50">
                            Protected by reCAPTCHA and Subject to <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link> & <Link href="/privacy" className="underline hover:text-white transition-colors">Terms</Link>.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
