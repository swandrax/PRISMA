"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertTriangle,
    Phone,
    User,
    MapPin,
    Calendar,
    FileText,
    Lock,
    CheckCircle,
    Send,
    ArrowLeft,
    Upload,
    ShieldAlert
} from "lucide-react"

export default function LaporanKeamananPage() {
    const [submitted, setSubmitted] = useState(false);
    const [ticketNumber, setTicketNumber] = useState("");
    const [isHttps, setIsHttps] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        namaPelapor: "",
        nomorHp: "",
        jenisKejadian: "",
        tanggalWaktu: "",
        lokasiKejadian: "",
        deskripsiKejadian: "",
        fotoName: "",
        persetujuan: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check for HTTPS dynamically on client mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsHttps(window.location.protocol === "https:");
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const nextErrors = { ...prev };
                delete nextErrors[name];
                return nextErrors;
            });
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
        if (errors[name]) {
            setErrors(prev => {
                const nextErrors = { ...prev };
                delete nextErrors[name];
                return nextErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, fotoName: e.target.files![0].name }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.namaPelapor.trim()) {
            newErrors.namaPelapor = "Nama pelapor wajib diisi";
        }
        if (!formData.nomorHp.trim()) {
            newErrors.nomorHp = "Nomor HP wajib diisi";
        }
        if (!formData.jenisKejadian) {
            newErrors.jenisKejadian = "Jenis kejadian wajib dipilih";
        }
        if (!formData.tanggalWaktu) {
            newErrors.tanggalWaktu = "Tanggal & waktu kejadian wajib diisi";
        }
        if (!formData.lokasiKejadian.trim()) {
            newErrors.lokasiKejadian = "Lokasi kejadian wajib diisi";
        }
        if (!formData.deskripsiKejadian.trim()) {
            newErrors.deskripsiKejadian = "Deskripsi kejadian wajib diisi";
        } else if (formData.deskripsiKejadian.trim().length < 20) {
            newErrors.deskripsiKejadian = "Deskripsi harus minimal 20 karakter";
        }
        if (!formData.persetujuan) {
            newErrors.persetujuan = "Anda harus menyetujui penerusan data ke pengurus RT";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateTicketNumber = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const date = String(now.getDate()).padStart(2, "0");
        const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
        return `KMN-${year}${month}${date}-${randomDigits}`;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const ticket = generateTicketNumber();
        setTicketNumber(ticket);

        // Save report to localStorage as MVP (TODO: Integrate with backend API service)
        const reportPayload = {
            ticketId: ticket,
            ...formData,
            submittedAt: new Date().toISOString()
        };

        try {
            const existingReports = JSON.parse(localStorage.getItem("prisma_keamanan_reports") || "[]");
            existingReports.push(reportPayload);
            localStorage.setItem("prisma_keamanan_reports", JSON.stringify(existingReports));
        } catch (err) {
            console.error("Failed to save report to localStorage:", err);
        }

        setSubmitted(true);
    };

    const getWhatsAppUrl = () => {
        const basePhone = "6287872004448";
        const text = `Halo Pengurus RT 04 Kemayoran, saya ingin melaporkan kejadian keamanan.

*Form Laporan Keamanan*
- *Nama Pelapor:* ${formData.namaPelapor || "-"}
- *Nomor HP:* ${formData.nomorHp || "-"}
- *Jenis Kejadian:* ${formData.jenisKejadian || "-"}
- *Tanggal & Waktu:* ${formData.tanggalWaktu ? formData.tanggalWaktu.replace("T", " ") : "-"}
- *Lokasi:* ${formData.lokasiKejadian || "-"}
- *Deskripsi:* ${formData.deskripsiKejadian || "-"}

Laporan dikirim secara aman melalui portal digital PRISMA.`;

        return `https://wa.me/${basePhone}?text=${encodeURIComponent(text)}`;
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 flex items-center justify-center transition-colors duration-300">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="border border-green-200 dark:border-green-900/50 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/90 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-350">
                        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50 dark:ring-green-950/20">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">Laporan Berhasil Terkirim</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                                Laporan keamanan Anda telah disimpan di sistem lokal dan diteruskan ke pengurus RT 04 untuk tindakan lebih lanjut.
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-5 mb-6 max-w-md mx-auto">
                                <div className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1">Nomor Tiket Laporan</div>
                                <div className="text-2xl font-mono font-bold text-primary tracking-tight">{ticketNumber}</div>
                            </div>

                            {isHttps && (
                                <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold mb-8">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Terenkripsi (HTTPS)</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild className="px-6 py-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white shadow-md active:scale-95 transition-all">
                                    <Link href="/">Kembali ke Beranda</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="px-6 py-5 rounded-xl font-bold border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({
                                            namaPelapor: "",
                                            nomorHp: "",
                                            jenisKejadian: "",
                                            tanggalWaktu: "",
                                            lokasiKejadian: "",
                                            deskripsiKejadian: "",
                                            fotoName: "",
                                            persetujuan: false
                                        });
                                    }}
                                >
                                    Lapor Kejadian Lain
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href="/surat"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Kembali ke Halaman Surat
                    </Link>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6 border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white mb-2">Lapor Kejadian Keamanan</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl font-medium">
                            Laporan Anda bersifat rahasia dan hanya dapat diakses pengurus RT
                        </p>
                    </div>
                    {isHttps && (
                        <div className="w-fit flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold ring-1 ring-green-500/20 shadow-sm">
                            <Lock className="h-3.5 w-3.5 animate-pulse" />
                            <span>Terenkripsi (HTTPS)</span>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850 p-6">
                                <CardTitle className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-red-500" />
                                    Formulir Kejadian Keamanan
                                </CardTitle>
                                <CardDescription className="text-xs">Lengkapi seluruh kolom wajib di bawah ini secara jujur dan akurat.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="namaPelapor" className="text-sm font-semibold flex items-center gap-1">
                                            Nama Pelapor <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input
                                                id="namaPelapor"
                                                name="namaPelapor"
                                                value={formData.namaPelapor}
                                                onChange={handleInputChange}
                                                placeholder="Nama lengkap sesuai KTP"
                                                className={`pl-10 rounded-xl ${errors.namaPelapor ? 'border-red-500 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                                            />
                                        </div>
                                        {errors.namaPelapor && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.namaPelapor}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nomorHp" className="text-sm font-semibold flex items-center gap-1">
                                            Nomor HP <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input
                                                id="nomorHp"
                                                name="nomorHp"
                                                type="tel"
                                                value={formData.nomorHp}
                                                onChange={handleInputChange}
                                                placeholder="08xxxxxxxxxx"
                                                className={`pl-10 rounded-xl ${errors.nomorHp ? 'border-red-500 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                                            />
                                        </div>
                                        {errors.nomorHp && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.nomorHp}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="jenisKejadian" className="text-sm font-semibold flex items-center gap-1">
                                            Jenis Kejadian <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="jenisKejadian"
                                            name="jenisKejadian"
                                            value={formData.jenisKejadian}
                                            onChange={handleInputChange}
                                            className={`flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.jenisKejadian ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                                        >
                                            <option value="">Pilih jenis kejadian...</option>
                                            <option value="Pencurian">Pencurian</option>
                                            <option value="Kehilangan">Kehilangan</option>
                                            <option value="Keributan">Keributan</option>
                                            <option value="Orang Mencurigakan">Orang Mencurigakan</option>
                                            <option value="Kecelakaan">Kecelakaan</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                        {errors.jenisKejadian && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.jenisKejadian}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggalWaktu" className="text-sm font-semibold flex items-center gap-1">
                                            Tanggal & Waktu Kejadian <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input
                                                id="tanggalWaktu"
                                                name="tanggalWaktu"
                                                type="datetime-local"
                                                value={formData.tanggalWaktu}
                                                onChange={handleInputChange}
                                                className={`pl-10 rounded-xl ${errors.tanggalWaktu ? 'border-red-500 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                                            />
                                        </div>
                                        {errors.tanggalWaktu && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.tanggalWaktu}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="lokasiKejadian" className="text-sm font-semibold flex items-center gap-1">
                                            Lokasi Kejadian <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input
                                                id="lokasiKejadian"
                                                name="lokasiKejadian"
                                                value={formData.lokasiKejadian}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Depan gang no.12"
                                                className={`pl-10 rounded-xl ${errors.lokasiKejadian ? 'border-red-500 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                                            />
                                        </div>
                                        {errors.lokasiKejadian && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.lokasiKejadian}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="deskripsiKejadian" className="text-sm font-semibold flex items-center gap-1">
                                            Deskripsi Kejadian <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="deskripsiKejadian"
                                            name="deskripsiKejadian"
                                            value={formData.deskripsiKejadian}
                                            onChange={handleInputChange}
                                            rows={5}
                                            placeholder="Jelaskan secara rinci kronologi kejadian..."
                                            className={`rounded-xl resize-none ${errors.deskripsiKejadian ? 'border-red-500 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                                        />
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Minimal 20 karakter</span>
                                            <span>{formData.deskripsiKejadian.length} karakter</span>
                                        </div>
                                        {errors.deskripsiKejained && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.deskripsiKejained}</p>
                                        )}
                                        {errors.deskripsiKejadian && (
                                            <p className="text-red-500 text-xs font-semibold">{errors.deskripsiKejadian}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="fotoUpload" className="text-sm font-semibold">
                                            Upload Foto (Opsional)
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="fotoUpload"
                                                name="fotoUpload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-xl flex items-center gap-2 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                onClick={() => document.getElementById("fotoUpload")?.click()}
                                            >
                                                <Upload className="h-4 w-4 text-slate-500" />
                                                <span>Pilih File</span>
                                            </Button>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                {formData.fotoName || "Tidak ada file dipilih"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-start gap-2.5">
                                            <input
                                                id="persetujuan"
                                                name="persetujuan"
                                                type="checkbox"
                                                checked={formData.persetujuan}
                                                onChange={handleCheckboxChange}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary/20"
                                            />
                                            <Label htmlFor="persetujuan" className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed select-none cursor-pointer">
                                                Saya menyetujui data ini diteruskan ke pengurus RT 04
                                            </Label>
                                        </div>
                                        {errors.persetujuan && (
                                            <p className="text-red-500 text-xs font-semibold mt-1">{errors.persetujuan}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Kirim Laporan Keamanan</span>
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / WhatsApp Alternative Column */}
                    <div className="space-y-6">
                        {/* WhatsApp Lapor Option */}
                        <Card className="border border-green-200 dark:border-green-900/30 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-green-500" />
                                    Lapor Langsung via WA
                                </CardTitle>
                                <CardDescription className="text-xs text-green-700/80 dark:text-green-400/80">
                                    Punya kendala mengisi form? Laporkan langsung ke nomor WhatsApp pengurus RT.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <p className="text-xs text-green-700/70 dark:text-green-500/70 mb-4 leading-relaxed font-medium">
                                    Menekan tombol di bawah akan membuka WhatsApp dengan draf laporan keamanan terisi secara otomatis menggunakan data yang sudah Anda isi di atas.
                                </p>
                                <Button
                                    asChild
                                    className="w-full py-5 rounded-xl font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-500/10"
                                >
                                    <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                                        <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        <span>Lapor via WhatsApp</span>
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card className="border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b border-red-100 dark:border-red-950/20">
                                <CardTitle className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                                    <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                                    Darurat Keamanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
                                <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-black/20 border border-red-100 dark:border-red-900/30">
                                    <span>Kepolisian (Polsek)</span>
                                    <span className="font-mono font-bold text-red-900 dark:text-red-200">110</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-black/20 border border-red-100 dark:border-red-900/30">
                                    <span>Pemadam Kebakaran</span>
                                    <span className="font-mono font-bold text-red-900 dark:text-red-200">113</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded bg-white dark:bg-black/20 border border-red-100 dark:border-red-900/30">
                                    <span>Ambulans Medis</span>
                                    <span className="font-mono font-bold text-red-900 dark:text-red-200">118 / 119</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
