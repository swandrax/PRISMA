// c:\Users\user\Desktop\prisma\src\app\_offline\page.tsx
"use client"

import { WifiOff, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-8 h-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Anda Sedang Offline</h1>
                <p className="text-slate-500 mb-8">
                    Koneksi internet Anda terputus. Menampilkan data terakhir yang tersimpan di perangkat Anda.
                </p>
                <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Coba Lagi
                </Button>
            </div>
        </div>
    )
}
