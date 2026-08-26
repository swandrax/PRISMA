"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { secureStorage, sanitizeInput } from "@/lib/security"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    User,
    Phone,
    Calendar,
    Mail,
    MapPin,
    Camera,
    Settings,
    LogOut,
    Save,
    X,
    ArrowLeft,
    Shield,
    FileText,
    Home,
    Briefcase,
    Crown,
    UserCheck,
    CloudUpload,
    CheckCircle2
} from "lucide-react"
import { WargaSeedItem, INITIAL_50_WARGA } from "@/lib/seed-data"

export default function ProfilePage() {
    const router = useRouter();
    const [wargaList, setWargaList] = useState<WargaSeedItem[]>(INITIAL_50_WARGA);
    const [selectedWargaId, setSelectedWargaId] = useState<string>("warga-01");
    const [profile, setProfile] = useState<WargaSeedItem>(INITIAL_50_WARGA[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<WargaSeedItem>(INITIAL_50_WARGA[0]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingS3, setIsUploadingS3] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch real-time warga list on mount
    useEffect(() => {
        const fetchWarga = async () => {
            try {
                const res = await fetch("/api/warga");
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data?.length > 0) {
                        setWargaList(result.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load warga data:", err);
            }
        };
        fetchWarga();

        // Load saved active profile from secureStorage
        const savedProfile = secureStorage.get<WargaSeedItem>("active_warga_profile");
        if (savedProfile) {
            setProfile(savedProfile);
            setEditedProfile(savedProfile);
            setSelectedWargaId(savedProfile.id);
        }
    }, []);

    // Change active profile selection (for Admin/Pengurus CRUD preview)
    const handleSwitchProfile = (wargaId: string) => {
        const found = wargaList.find((w) => w.id === wargaId);
        if (found) {
            setProfile(found);
            setEditedProfile(found);
            setSelectedWargaId(wargaId);
            setIsEditing(false);
            secureStorage.set("active_warga_profile", found, { encrypt: true });
        }
    };

    const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            alert('Ukuran file maksimal 4MB.');
            return;
        }

        // Preview local immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPhotoPreview(base64);
        };
        reader.readAsDataURL(file);

        // Upload to Neon S3 Object Storage
        setIsUploadingS3(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            formData.append("wargaId", profile.id);

            const res = await fetch("/api/profile", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setNotification("Foto profil berhasil diupload ke Neon S3 Storage!");
                setTimeout(() => setNotification(null), 4000);
            }
        } catch (error) {
            console.error("S3 upload failed:", error);
        } finally {
            setIsUploadingS3(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);

        const sanitizedProfile: WargaSeedItem = {
            ...editedProfile,
            nama: sanitizeInput(editedProfile.nama),
            nik: sanitizeInput(editedProfile.nik),
            email: sanitizeInput(editedProfile.email),
            telepon: sanitizeInput(editedProfile.telepon),
            alamat: sanitizeInput(editedProfile.alamat),
            blok: sanitizeInput(editedProfile.blok),
            noRumah: sanitizeInput(editedProfile.noRumah),
            pekerjaan: sanitizeInput(editedProfile.pekerjaan),
            jabatanPengurus: editedProfile.jabatanPengurus ? sanitizeInput(editedProfile.jabatanPengurus) : undefined,
        };

        try {
            const res = await fetch("/api/warga", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitizedProfile),
            });

            if (res.ok) {
                setProfile(sanitizedProfile);
                setEditedProfile(sanitizedProfile);
                setIsEditing(false);
                secureStorage.set("active_warga_profile", sanitizedProfile, { encrypt: true });
                setNotification("Data profil berhasil diperbarui secara real-time!");
                setTimeout(() => setNotification(null), 3000);

                // Update runtime list
                setWargaList((prev) =>
                    prev.map((w) => (w.id === sanitizedProfile.id ? sanitizedProfile : w))
                );
            } else {
                alert("Gagal memperbarui profil di server.");
            }
        } catch (err) {
            console.error("Gagal menyimpan profil:", err);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleLogout = () => {
        secureStorage.remove("active_warga_profile");
        localStorage.removeItem("warga_logged_in");
        router.push("/auth/login");
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl space-y-6">
                {/* Notification Banner */}
                {notification && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{notification}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                            <Link href="/admin">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                Profil & Akun RT 04
                                {profile.role === "ADMIN" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                        ADMINISTRATOR
                                    </span>
                                )}
                                {profile.role === "PENGURUS" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        PENGURUS RT
                                    </span>
                                )}
                                {profile.role === "WARGA" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">
                                        WARGA
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400">Manajemen profil warga & kontrol database Neon</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {isEditing ? "Batal Edit" : "Edit Profil"}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowLogoutConfirm(true)}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Keluar
                        </Button>
                    </div>
                </div>

                {/* Role-Based Profile Switcher for Admin & Pengurus */}
                {(profile.role === "ADMIN" || profile.role === "PENGURUS") && (
                    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                                <UserCheck className="h-4 w-4 text-blue-400" />
                                <span>Panel Manajemen Profil (50 Data Warga Terintegrasi Neon)</span>
                            </div>
                            <span className="text-xs text-slate-400">Total: {wargaList.length} Warga</span>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="text-xs text-slate-400 whitespace-nowrap">Pilih Akun / Warga:</label>
                                <select
                                    value={selectedWargaId}
                                    onChange={(e) => handleSwitchProfile(e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {wargaList.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.nama} — {w.role} ({w.jabatanPengurus || `Blok ${w.blok}/${w.noRumah}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Photo & Badges */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                {/* Photo Container with S3 Upload */}
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto flex items-center justify-center border-2 border-slate-700 shadow-xl">
                                        {photoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={photoPreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-16 w-16 text-slate-300" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingS3}
                                        className="absolute bottom-0 right-0 p-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors shadow-lg disabled:opacity-50"
                                        title="Upload foto ke Neon S3"
                                    >
                                        {isUploadingS3 ? <CloudUpload className="h-4 w-4 animate-bounce" /> : <Camera className="h-4 w-4" />}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-white">{profile.nama}</h2>
                                <p className="text-sm text-slate-400">{profile.email}</p>

                                {profile.jabatanPengurus && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                                        <Crown className="h-3.5 w-3.5" />
                                        {profile.jabatanPengurus}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-slate-800 text-left space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <MapPin className="h-4 w-4 text-blue-400" />
                                        <span>Blok {profile.blok} No. {profile.noRumah}, RT {profile.rt}/RW {profile.rw}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Briefcase className="h-4 w-4 text-purple-400" />
                                        <span>{profile.pekerjaan || "Wiraswasta"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Calendar className="h-4 w-4 text-emerald-400" />
                                        <span>Lahir: {formatDate(profile.tanggalLahir)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Action Navigation */}
                        <Card className="border-slate-800 bg-slate-900/50">
                            <CardContent className="p-4 space-y-2 text-sm">
                                <Link href="/surat" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-300">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    <span>Layanan Surat Warga</span>
                                </Link>
                                <Link href="/keuangan/laporan" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-300">
                                    <Home className="h-4 w-4 text-emerald-400" />
                                    <span>Kas & Iuran Warga</span>
                                </Link>
                                <Link href="/surat/keamanan" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-300">
                                    <Shield className="h-4 w-4 text-rose-400" />
                                    <span>Laporan Keamanan RT</span>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Full Profile & CRUD Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
                                <div>
                                    <CardTitle className="text-lg text-white">Informasi Kependudukan</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        {isEditing ? "Perbarui detail demografi warga di Neon Postgres" : "Detail profil kependudukan terdaftar"}
                                    </CardDescription>
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Batal
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            <Save className="h-4 w-4 mr-1" />
                                            {isSaving ? "Menyimpan..." : "Simpan"}
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* NIK */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Nomor Induk Kependudukan (NIK)</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.nik}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, nik: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.nik}</p>
                                        )}
                                    </div>

                                    {/* No KK */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Nomor Kartu Keluarga (KK)</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.noKK}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, noKK: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.noKK || "-"}</p>
                                        )}
                                    </div>

                                    {/* Nama */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-400">Nama Lengkap</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.nama}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, nama: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.nama}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-blue-400" />
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editedProfile.email}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.email}</p>
                                        )}
                                    </div>

                                    {/* Telepon */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-emerald-400" />
                                            No. Telepon / WhatsApp
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editedProfile.telepon}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, telepon: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.telepon}</p>
                                        )}
                                    </div>

                                    {/* Pekerjaan */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Pekerjaan</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.pekerjaan}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, pekerjaan: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.pekerjaan}</p>
                                        )}
                                    </div>

                                    {/* Jabatan Pengurus (Editable by Admin/Pengurus) */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Jabatan Kepengurusan RT</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="Contoh: Ketua RT, Bendahara, Warga"
                                                value={editedProfile.jabatanPengurus || ""}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, jabatanPengurus: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.jabatanPengurus || "Warga Biasa"}</p>
                                        )}
                                    </div>

                                    {/* Alamat Lengkap */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-medium text-slate-400">Alamat Tempat Tinggal</label>
                                        {isEditing ? (
                                            <textarea
                                                rows={2}
                                                value={editedProfile.alamat}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, alamat: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">{profile.alamat}</p>
                                        )}
                                    </div>

                                    {/* Blok & No Rumah */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Blok</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.blok}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, blok: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">Blok {profile.blok}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-400">Nomor Rumah</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.noRumah}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, noRumah: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-200">No. {profile.noRumah}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-white shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <LogOut className="h-5 w-5 text-rose-500" />
                                Konfirmasi Keluar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400">
                                Apakah Anda yakin ingin keluar dari sesi akun profil ini?
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="flex-1 bg-rose-600 hover:bg-rose-500"
                            >
                                Keluar
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
