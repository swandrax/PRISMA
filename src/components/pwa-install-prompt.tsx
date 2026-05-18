"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Smartphone, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Cek jika sudah dalam mode standalone (sudah diinstall)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        if (isStandalone) return

        // Handler untuk event beforeinstallprompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Tampilkan prompt setelah delay kecil agar tidak mengganggu load awal
            setTimeout(() => setShowPrompt(true), 3000)
        }

        // Deteksi iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setTimeout(() => {
            setIsIOS(isIosDevice)
        }, 0)

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Tampilkan instruksi manual untuk iOS jika belum diinstall
        if (isIosDevice && !isStandalone) {
            // Cek localStorage agar tidak spamming user iOS
            const hasSeenIOSPrompt = localStorage.getItem('prisma_ios_prompt_seen')
            if (!hasSeenIOSPrompt) {
                setTimeout(() => setShowPrompt(true), 3000)
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice

        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt')
            setShowPrompt(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        if (isIOS) {
            localStorage.setItem('prisma_ios_prompt_seen', 'true')
        }
    }

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <div className="bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Smartphone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Install Aplikasi PRISMA</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Akses lebih cepat dan gunakan secara offline.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                <p>Untuk menginstall di iOS:</p>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                    <li>Ketuk tombol <strong>Share</strong> di browser</li>
                                    <li>Pilih <strong>Add to Home Screen</strong></li>
                                </ol>
                            </div>
                        ) : (
                            <Button onClick={handleInstall} className="w-full gap-2">
                                <Download className="h-4 w-4" />
                                Install Sekarang
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
