// c:\Users\user\Desktop\prisma\src\components\InstallPrompt.tsx
"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Handle visit count and dismissal logic
        const checkVisibility = () => {
            const dismissedAt = localStorage.getItem("pwa_prompt_dismissed")
            if (dismissedAt) {
                const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24)
                if (daysSinceDismissed < 7) {
                    return false // Don't show if dismissed within 7 days
                }
            }

            const visits = parseInt(localStorage.getItem("pwa_visit_count") || "0", 10) + 1
            localStorage.setItem("pwa_visit_count", visits.toString())

            return visits >= 2 // Show after 2 visits
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
            
            if (checkVisibility()) {
                setIsVisible(true)
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
            setIsVisible(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("pwa_prompt_dismissed", Date.now().toString())
    }

    if (!isVisible || !isInstallable) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Install Aplikasi</h3>
                        <p className="text-sm text-slate-500 leading-tight">Install PRISMA RT04 di perangkat Anda untuk akses lebih cepat dan offline.</p>
                    </div>
                </div>
                <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex gap-2 mt-4">
                <button 
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Nanti Saja
                </button>
                <button 
                    onClick={handleInstall}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                    Install
                </button>
            </div>
        </div>
    )
}
