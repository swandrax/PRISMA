"use client"

import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MarketingPage() {
    const [portalUrl, setPortalUrl] = useState('https://prisma-rt-04.vercel.app')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Default to the current origin if not localhost, otherwise use the vercel app URL
            if (!window.location.origin.includes('localhost')) {
                setPortalUrl(window.location.origin)
            }
        }
    }, [])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 min-h-screen bg-slate-50 print:bg-white print:p-0 print:m-0">
            {/* Header (Hidden on Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden bg-white p-6 rounded-xl shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing & Publikasi</h1>
                    <p className="text-muted-foreground mt-1">
                        Buat materi promosi dan brosur QR Code untuk dipasang di papan pengumuman RT.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handlePrint} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Printer className="h-4 w-4" />
                        Cetak Brosur
                    </Button>
                </div>
            </div>

            {/* Print Area: A4 Size Container */}
            <div className="flex justify-center print:block print:w-full">
                <div className="w-full max-w-[210mm] min-h-[297mm] bg-white rounded-xl shadow-xl border overflow-hidden relative print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0">
                    
                    {/* Top Decorative Header */}
                    <div className="h-32 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 absolute top-0 left-0 w-full" />
                    
                    {/* Flyer Content */}
                    <div className="relative z-10 pt-16 px-12 flex flex-col items-center text-center h-full">
                        
                        {/* Logo / Badge Area */}
                        <div className="bg-white p-4 rounded-3xl shadow-lg border-4 border-indigo-50 mb-8 mt-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200">
                                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-700 to-purple-700">
                                    PRISMA
                                </span>
                            </div>
                        </div>

                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                            RT 04 Kemayoran
                        </h1>
                        
                        <div className="inline-block px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-12">
                            <h2 className="text-2xl font-bold text-indigo-700 tracking-wide">
                                Guyub Digital, Transparan Nyata.
                            </h2>
                        </div>

                        <p className="text-xl text-slate-600 font-medium max-w-lg mb-12 leading-relaxed">
                            Urus keperluan RT dari genggaman tangan. Scan QR Code di bawah ini untuk mengakses portal resmi warga.
                        </p>

                        {/* QR Code Section */}
                        <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 mb-12 relative group">
                            <div className="absolute inset-0 border-4 border-indigo-600/10 rounded-3xl -m-4" />
                            <QRCodeSVG 
                                value={portalUrl} 
                                size={240} 
                                level="H"
                                includeMargin={true}
                                fgColor="#1e1b4b"
                            />
                            <p className="text-sm font-bold text-slate-400 mt-4 tracking-widest uppercase">SCAN DI SINI</p>
                        </div>

                        {/* 3 Core Benefits */}
                        <div className="w-full mt-auto mb-16 px-4">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Benefit 1 */}
                                <div className="flex flex-col items-center p-4">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Surat Otomatis</h3>
                                    <p className="text-slate-500 text-sm">Buat surat pengantar secara digital tanpa repot.</p>
                                </div>
                                {/* Benefit 2 */}
                                <div className="flex flex-col items-center p-4">
                                    <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Laporan Terbuka</h3>
                                    <p className="text-slate-500 text-sm">Transparansi penggunaan dana iuran warga.</p>
                                </div>
                                {/* Benefit 3 */}
                                <div className="flex flex-col items-center p-4">
                                    <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Lapor Keamanan</h3>
                                    <p className="text-slate-500 text-sm">Respons cepat tanggap untuk masalah lingkungan.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer text */}
                        <div className="mt-auto pb-8 w-full border-t border-slate-100 pt-6">
                            <p className="text-slate-400 font-medium">{portalUrl}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
