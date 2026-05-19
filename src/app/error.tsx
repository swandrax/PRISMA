"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Bug, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    const router = useRouter()

    useEffect(() => {
        // Log error to console in development
        console.error("Error caught by error boundary:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border-red-200 dark:border-red-800">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl text-red-700 dark:text-red-300">
                        Oops! Terjadi Kesalahan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Aplikasi mengalami error yang tidak terduga. Jangan khawatir, data Anda aman.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                <Bug className="h-4 w-4" />
                                Detail Error (Development)
                            </div>
                            <p className="text-xs font-mono text-red-600/80 dark:text-red-300/80 break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => reset()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Coba Lagi
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Beranda
                            </Link>
                        </Button>
                    </div>

                    {/* Additional Navigation */}
                    <div className="flex justify-center pt-4 border-t">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Halaman Sebelumnya
                        </Button>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-700 dark:text-blue-300">
                            Data Anda terlindungi dengan enkripsi bcrypt dan standar keamanan OWASP.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
