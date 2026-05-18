"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertTriangle,
    Phone,
    User,
    MapPin,
    Calendar,
    Clock,
    FileText,
    Lock,
    CheckCircle,
    Send,
    Eye,
    EyeOff,
    Info,
    QrCode
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { useKeamananViewModel } from "@/viewmodels/useKeamananViewModel"

export default function LaporanKeamananPage() {
    // ViewModel — single source of truth for keamanan data
    const {
        incidentTypes,
        isLoading: loading,
        isSubmitting: submitting,
    } = useKeamananViewModel();

    const [submitted, setSubmitted] = useState(false);
    const [reportId, setReportId] = useState<string | null>(null);
    const [showPhone, setShowPhone] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        kronologi: '',
        tanggal_kejadian: '',
        waktu_kejadian: '',
        lokasi: '',
        nama_pelapor: '',
        telepon_pelapor: '',
        jenis_kejadian: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.kronologi.trim()) {
            newErrors.kronologi = 'Kronologi kejadian wajib diisi';
        } else if (formData.kronologi.length < 20) {
            newErrors.kronologi = 'Kronologi harus minimal 20 karakter';
        } else if (formData.kronologi.length > 5000) {
            newErrors.kronologi = 'Kronologi maksimal 5000 karakter';
        }

        if (!formData.tanggal_kejadian) {
            newErrors.tanggal_kejadian = 'Tanggal kejadian wajib diisi';
        }

        if (!formData.nama_pelapor.trim()) {
            newErrors.nama_pelapor = 'Nama pelapor wajib diisi';
        }

        if (!formData.telepon_pelapor.trim()) {
            newErrors.telepon_pelapor = 'Nomor telepon wajib diisi';
        } else {
            // Indonesian phone number validation
            const phoneRegex = /^(08|\+?628)\d{8,11}$/;
            const cleaned = formData.telepon_pelapor.replace(/\D/g, '');
            if (!phoneRegex.test(cleaned) && !phoneRegex.test('+62' + cleaned.slice(1))) {
                newErrors.telepon_pelapor = 'Format nomor telepon tidak valid (contoh: 08123456789)';
            }
        }

        if (!formData.jenis_kejadian) {
            newErrors.jenis_kejadian = 'Jenis kejadian wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Get handleSubmitReport from ViewModel
    const vmRef = useKeamananViewModel();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Submit through ViewModel → Repository → SqliteDB pipeline
            const result = await vmRef.handleSubmitReport({
                kronologi: formData.kronologi,
                tanggalKejadian: formData.tanggal_kejadian,
                waktuKejadian: formData.waktu_kejadian,
                lokasi: formData.lokasi,
                namaPelapor: formData.nama_pelapor,
                teleponPelapor: formData.telepon_pelapor,
                jenisKejadian: formData.jenis_kejadian,
            });

            if (result.success) {
                setSubmitted(true);
                setReportId(result.reportId ?? 'RPT-' + Date.now().toString(36).toUpperCase());
            } else {
                setErrors({ submit: result.errors?.[0] ?? 'Terjadi kesalahan. Silakan coba lagi.' });
            }
        } catch {
            setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-600';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-900 dark:via-green-950/30 dark:to-slate-900 py-8 transition-colors duration-300 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="bg-white dark:bg-slate-900/60 border-green-200 dark:border-green-500/30 shadow-xl backdrop-blur-md">
                        <CardContent className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Laporan Berhasil Dikirim</h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-6">
                                Laporan keamanan Anda telah diterima dan akan segera ditindaklanjuti oleh tim keamanan RT.
                            </p>
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30 rounded-xl p-5 mb-6">
                                <div className="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-300 mb-1">ID Laporan</div>
                                <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-400">{reportId}</div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400 mb-8">
                                <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span>Data Anda dilindungi dengan enkripsi bcrypt</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg active:scale-[0.98] transition-transform">
                                    <Link href="/">Kembali ke Beranda</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-bold py-6 px-8 rounded-xl active:scale-[0.98] transition-transform"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({
                                            kronologi: '',
                                            tanggal_kejadian: '',
                                            waktu_kejadian: '',
                                            lokasi: '',
                                            nama_pelapor: '',
                                            telepon_pelapor: '',
                                            jenis_kejadian: '',
                                        });
                                    }}
                                >
                                    Buat Laporan Baru
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-slate-900 dark:via-red-900/20 dark:to-slate-900 py-8 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <Button variant="outline" asChild className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 border-none w-fit font-semibold px-5 rounded-xl shadow-sm">
                        <Link href="/surat">
                            <FaWhatsapp className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Laporan Keamanan</h1>
                        <p className="text-red-600 dark:text-red-300 font-medium">Laporkan kejadian keamanan di lingkungan RT</p>
                    </div>
                </div>

                {/* Security Info Banner */}
                <Card className="bg-blue-50 dark:bg-gradient-to-r dark:from-blue-950/40 dark:to-cyan-950/40 border-blue-200 dark:border-blue-800/30 mb-8 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                <Lock className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-base">Keamanan Terjamin & Tervalidasi</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                                    Data dilindungi enkripsi bcrypt. Laporan akan divalidasi dengan QR Code unik sebagai pertanggungjawaban legal agar tidak sembarang melapor.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <div className="p-3 bg-white dark:bg-black/20 rounded-xl border border-blue-200 dark:border-blue-900/30 flex flex-col items-center justify-center min-w-[90px] shadow-inner">
                                    <QrCode className="h-8 w-8 text-slate-800 dark:text-blue-300" />
                                    <span className="text-[10px] font-bold mt-1 text-slate-600 dark:text-blue-400 tracking-wider">VALIDATOR</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form - Left Column */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-red-900/30 shadow-xl backdrop-blur-md rounded-2xl">
                            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-5">
                                <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2.5 font-bold text-xl">
                                    <FileText className="h-5.5 w-5.5 text-red-500 dark:text-red-400" />
                                    Form Laporan Keamanan
                                </CardTitle>
                                <CardDescription className="text-slate-500 dark:text-gray-400">
                                    Isi form berikut dengan lengkap dan jelas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Jenis Kejadian */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            <AlertTriangle className="inline h-4 w-4 mr-1.5 text-red-500 dark:text-red-400" />
                                            Jenis Kejadian <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <select
                                            name="jenis_kejadian"
                                            value={formData.jenis_kejadian}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.jenis_kejadian ? 'border-red-500' : 'border-slate-300 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium`}
                                        >
                                            <option value="" className="bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400">Pilih jenis kejadian...</option>
                                            {incidentTypes.map((type) => (
                                                <option key={type.id} value={type.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.jenis_kejadian && (
                                            <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium">{errors.jenis_kejadian}</p>
                                        )}
                                    </div>

                                    {/* Kronologi */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            <FileText className="inline h-4 w-4 mr-1.5 text-red-500 dark:text-red-400" />
                                            Kronologi Kejadian <span className="text-red-500 dark:text-red-400">*</span>
                                        </label>
                                        <textarea
                                            name="kronologi"
                                            value={formData.kronologi}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder="Ceritakan secara detail apa yang terjadi, kapan, dan bagaimana..."
                                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.kronologi ? 'border-red-500' : 'border-slate-300 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all`}
                                        />
                                        <div className="flex justify-between mt-1.5">
                                            {errors.kronologi ? (
                                                <p className="text-red-500 dark:text-red-400 text-sm font-medium">{errors.kronologi}</p>
                                            ) : (
                                                <p className="text-slate-500 dark:text-gray-400 text-sm">Minimal 20 karakter</p>
                                            )}
                                            <p className="text-slate-500 dark:text-gray-400 text-sm font-mono">{formData.kronologi.length}/5000</p>
                                        </div>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                <Calendar className="inline h-4 w-4 mr-1.5 text-red-500 dark:text-red-400" />
                                                Tanggal Kejadian <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="tanggal_kejadian"
                                                value={formData.tanggal_kejadian}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.tanggal_kejadian ? 'border-red-500' : 'border-slate-300 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium`}
                                            />
                                            {errors.tanggal_kejadian && (
                                                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium">{errors.tanggal_kejadian}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                <Clock className="inline h-4 w-4 mr-1.5 text-slate-500 dark:text-gray-400" />
                                                Waktu Kejadian
                                            </label>
                                            <input
                                                type="time"
                                                name="waktu_kejadian"
                                                value={formData.waktu_kejadian}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Lokasi */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            <MapPin className="inline h-4 w-4 mr-1.5 text-slate-500 dark:text-gray-400" />
                                            Lokasi Kejadian
                                        </label>
                                        <input
                                            type="text"
                                            name="lokasi"
                                            value={formData.lokasi}
                                            onChange={handleInputChange}
                                            placeholder="Contoh: Blok A depan rumah No. 5"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                                        />
                                    </div>

                                    {/* Contact Info */}
                                    <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Informasi Pelapor</h4>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                    <User className="inline h-4 w-4 mr-1.5 text-red-500 dark:text-red-400" />
                                                    Nama Pelapor <span className="text-red-500 dark:text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nama_pelapor"
                                                    value={formData.nama_pelapor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nama lengkap Anda"
                                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border ${errors.nama_pelapor ? 'border-red-500' : 'border-slate-300 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium`}
                                                />
                                                {errors.nama_pelapor && (
                                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium">{errors.nama_pelapor}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                    <Phone className="inline h-4 w-4 mr-1.5 text-red-500 dark:text-red-400" />
                                                    No. Telepon <span className="text-red-500 dark:text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPhone ? "text" : "password"}
                                                        name="telepon_pelapor"
                                                        value={formData.telepon_pelapor}
                                                        onChange={handleInputChange}
                                                        placeholder="08123456789"
                                                        className={`w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-800/50 border ${errors.telepon_pelapor ? 'border-red-500' : 'border-slate-300 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono font-medium`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPhone(!showPhone)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                                    >
                                                        {showPhone ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                {errors.telepon_pelapor && (
                                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1.5 font-medium">{errors.telepon_pelapor}</p>
                                                )}
                                                <p className="text-slate-500 dark:text-gray-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                                                    <Lock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                    Nomor telepon dienkripsi untuk keamanan
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {errors.submit && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{errors.submit}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-red-600/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2.5"></div>
                                                Mengirim Laporan...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5 mr-2.5" />
                                                Kirim Laporan Keamanan
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-4">
                        {/* Priority Legend */}
                        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-red-900/30 shadow-md backdrop-blur-md rounded-2xl">
                            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                <CardTitle className="text-slate-800 dark:text-white text-base font-bold">Tingkat Prioritas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                {incidentTypes.map((type) => (
                                    <div key={type.id} className="flex items-center gap-3">
                                        <div className={`w-3.5 h-3.5 rounded-full ${getPriorityColor(type.priority)} shadow-sm`}></div>
                                        <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">{type.label}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border-red-200 dark:border-red-800/30 shadow-md rounded-2xl">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-red-100 dark:bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 dark:text-red-200 text-base">Keadaan Darurat?</h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                                            Untuk keadaan darurat, hubungi langsung:
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            <div className="text-sm text-red-800 dark:text-red-200 bg-white/60 dark:bg-black/25 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/30">
                                                <strong>Pos Keamanan:</strong> <span className="font-bold font-mono">021-xxxx-xxxx</span>
                                            </div>
                                            <div className="text-sm text-red-800 dark:text-red-200 bg-white/60 dark:bg-black/25 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/30">
                                                <strong>Polisi:</strong> <span className="font-bold font-mono">110</span>
                                            </div>
                                            <div className="text-sm text-red-800 dark:text-red-200 bg-white/60 dark:bg-black/25 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/30">
                                                <strong>Pemadam:</strong> <span className="font-bold font-mono">113</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-red-900/30 shadow-md backdrop-blur-md rounded-2xl">
                            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
                                <CardTitle className="text-slate-800 dark:text-white text-base font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Tips Pelaporan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2.5 pt-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <p>• Tuliskan kronologi sejelas mungkin</p>
                                <p>• Sertakan tanggal dan waktu yang akurat</p>
                                <p>• Sebutkan lokasi dengan detail</p>
                                <p>• Pastikan nomor telepon aktif</p>
                                <p>• Data Anda akan dienkripsi dan aman</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
