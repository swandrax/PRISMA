"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Send, X } from 'lucide-react'
import { useClickOutside } from '@/hooks/use-click-outside'
import { secureStorage } from '@/lib/security'

const RT_PHONE_NUMBER = '6287872004448'

interface WargaProfile {
    nama: string
    telepon?: string
    alamat?: string
}

export function WhatsAppDirect() {
    const [isOpen, setIsOpen] = useState(false)
    const [wargaProfile, setWargaProfile] = useState<WargaProfile | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = localStorage.getItem('warga_logged_in')
            const profile = secureStorage.get<WargaProfile>('warga_profile')

            if (loggedIn && profile) {
                setIsLoggedIn(true)
                setWargaProfile(profile)
            } else {
                setIsLoggedIn(false)
                setWargaProfile(null)
            }
        }

        checkLogin()
        window.addEventListener('storage', checkLogin)
        return () => window.removeEventListener('storage', checkLogin)
    }, [])

    const openWhatsApp = (phoneNumber: string, message: string = '') => {
        const encodedMessage = encodeURIComponent(message)
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const contactRT = () => {
        const message = wargaProfile
            ? `Halo Pengurus RT 04, saya ${wargaProfile.nama}. Saya ingin bertanya tentang...`
            : 'Halo Pengurus RT 04, saya ingin bertanya tentang...'
        openWhatsApp(RT_PHONE_NUMBER, message)
    }

    const sendToWarga = () => {
        if (!wargaProfile?.telepon) return

        // Clean phone number (remove leading 0, add 62)
        let phone = wargaProfile.telepon.replace(/\D/g, '')
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1)
        } else if (!phone.startsWith('62')) {
            phone = '62' + phone
        }

        const message = `Halo ${wargaProfile.nama}, ini pesan dari Pengurus RT 04 Kemayoran.`
        openWhatsApp(phone, message)
    }

    const containerRef = useRef<HTMLDivElement>(null)

    useClickOutside(containerRef, () => setIsOpen(false))

    return (
        <div ref={containerRef} className="relative z-50">
            {/* Floating Button */}
            <div className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                <Button
                    size="lg"
                    className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600 text-white transition-transform active:scale-95"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                </Button>
            </div>

            {/* Quick Actions Panel */}
            {isOpen && (
                <div className="fixed bottom-36 right-4 z-50 w-72 bg-background border rounded-xl shadow-xl p-4 space-y-3 animate-in slide-in-from-bottom-5 duration-150 ease-out origin-bottom-right">
                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        WhatsApp Quick Connect
                    </h3>

                    {/* Contact RT Button */}
                    <Button
                        className="w-full justify-start gap-3 bg-green-500 hover:bg-green-600 text-white transition-colors active:bg-green-700"
                        onClick={contactRT}
                    >
                        <MessageCircle className="h-5 w-5" />
                        <div className="text-left">
                            <div className="font-medium">Hubungi Pengurus RT</div>
                            <div className="text-xs opacity-80">+62 878-7200-4448</div>
                        </div>
                    </Button>

                    {/* Send to Warga (only visible for RT admins or when warga has phone) */}
                    {isLoggedIn && wargaProfile?.telepon && (
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 border-green-500 text-green-600 hover:bg-green-50 transition-colors active:bg-green-100"
                            onClick={sendToWarga}
                        >
                            <Send className="h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Pesan ke {wargaProfile.nama}</div>
                                <div className="text-xs opacity-80">{wargaProfile.telepon}</div>
                            </div>
                        </Button>
                    )}

                    {!isLoggedIn && (
                        <p className="text-xs text-muted-foreground text-center">
                            Login untuk mengakses fitur lengkap
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default WhatsAppDirect
