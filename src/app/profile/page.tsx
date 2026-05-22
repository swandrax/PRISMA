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
    Edit,
    Save,
    X,
    Check,
    ArrowLeft,
    Shield,
    FileText,
    Home
} from "lucide-react"

interface UserProfile {
    id: number;
    nama: string;
    email: string;
    no_telepon: string;
    tanggal_lahir: string;
    alamat: string;
    blok: string;
    no_rumah: string;
    foto_path: string | null;
    status: string;
    tanggal_daftar: string;
}

// Mock user data (in production, fetch from API with auth)
const mockUserProfile: UserProfile = {
    id: 1,
    nama: "Ahmad Sudrajat",
    email: "ahmad@email.com",
    no_telepon: "081234567890",
    tanggal_lahir: "1990-05-15",
    alamat: "Gg. Bugis No. 95",
    blok: "A",
    no_rumah: "15",
    foto_path: null,
    status: "Aktif",
    tanggal_daftar: "2024-01-10",
};

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>(mockUserProfile);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if user is logged in
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('warga_logged_in');
        if (!isLoggedIn) {
            router.push('/auth/login');
        }

        // Load saved profile from secureStorage (encrypted) with localStorage fallback
        const secureProfile = secureStorage.get<UserProfile>('warga_profile');
        const savedProfile = secureProfile || (() => {
            const raw = localStorage.getItem('warga_profile');
            return raw ? JSON.parse(raw) : null;
        })();
        if (savedProfile) {
            setTimeout(() => {
                setProfile(savedProfile);
                setEditedProfile(savedProfile);
            }, 0);
        }

        // SEC-FIX DB-3: Load photo from secureStorage first, then fallback
        const securePhoto = secureStorage.get<string>('warga_photo');
        const savedPhoto = securePhoto || localStorage.getItem('warga_photo');
        if (savedPhoto) {
            setTimeout(() => {
                setPhotoPreview(savedPhoto);
            }, 0);
        }
    }, [router]);

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // SEC-009 FIX: Validate file type and size before processing
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            const maxSizeBytes = 2 * 1024 * 1024; // 2MB max

            if (!allowedTypes.includes(file.type)) {
                alert('Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.');
                return;
            }

            if (file.size > maxSizeBytes) {
                alert('Ukuran file terlalu besar. Maksimal 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPhotoPreview(base64);
                // SEC-FIX DB-3: Store photo in encrypted secureStorage instead of plaintext localStorage
                secureStorage.set('warga_photo', base64, { encrypt: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // SEC-FIX: Sanitize profile fields before saving to prevent stored XSS
        const sanitizedProfile = {
            ...editedProfile,
            nama: sanitizeInput(editedProfile.nama),
            email: sanitizeInput(editedProfile.email),
            alamat: sanitizeInput(editedProfile.alamat),
            blok: sanitizeInput(editedProfile.blok),
            no_rumah: sanitizeInput(editedProfile.no_rumah),
        };

        setProfile(sanitizedProfile);
        // SEC-FIX: Store in encrypted secureStorage
        secureStorage.set('warga_profile', sanitizedProfile, { encrypt: true, expiry: 24 * 60 * 60 * 1000 });

        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('warga_logged_in');
        localStorage.removeItem('warga_profile');
        localStorage.removeItem('warga_photo');
        // SEC-FIX: Also clear encrypted storage
        secureStorage.remove('warga_profile');
        secureStorage.remove('warga_photo');
        router.push('/auth/login');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Saya</h1>
                            <p className="text-blue-600 dark:text-blue-300">Kelola data dan pengaturan akun</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {isEditing ? 'Batal Edit' : 'Pengaturan'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowLogoutConfirm(true)}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Photo Card */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 shadow-sm">
                            <CardContent className="p-6 text-center">
                                {/* Photo */}
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 mx-auto flex items-center justify-center">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-16 w-16 text-white" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.nama}</h2>
                                <p className="text-muted-foreground">{profile.email}</p>

                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-500/20 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-700 dark:text-green-400">{profile.status}</span>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 text-left space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                                        <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-sm">Blok {profile.blok} No. {profile.no_rumah}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                        <span className="text-sm">Bergabung {formatDate(profile.tanggal_daftar)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 mt-4 shadow-sm">
                            <CardContent className="p-4 space-y-2">
                                <Link href="/surat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-gray-300">
                                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    <span>Ajukan Surat</span>
                                </Link>
                                <Link href="/keuangan/laporan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-gray-300">
                                    <Home className="h-5 w-5 text-green-500 dark:text-green-400" />
                                    <span>Lihat Iuran</span>
                                </Link>
                                <Link href="/surat/keamanan" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-gray-300">
                                    <Shield className="h-5 w-5 text-red-500 dark:text-red-400" />
                                    <span>Lapor Keamanan</span>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Details Card */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white">Data Pribadi</CardTitle>
                                        <CardDescription className="text-muted-foreground">
                                            {isEditing ? 'Edit informasi pribadi Anda' : 'Informasi akun terdaftar'}
                                        </CardDescription>
                                    </div>
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Batal
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {isSaving ? (
                                                    <span className="animate-spin mr-1">⏳</span>
                                                ) : (
                                                    <Save className="h-4 w-4 mr-1" />
                                                )}
                                                Simpan
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Nama */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Nama Lengkap
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.nama}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, nama: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-foreground text-lg">{profile.nama}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedProfile.email}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-foreground text-lg">{profile.email}</p>
                                    )}
                                </div>

                                {/* No Telepon */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        No. Telepon
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.no_telepon}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, no_telepon: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-foreground text-lg">{profile.no_telepon}</p>
                                    )}
                                </div>

                                {/* Tanggal Lahir */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Lahir
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedProfile.tanggal_lahir}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, tanggal_lahir: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-foreground text-lg">{formatDate(profile.tanggal_lahir)}</p>
                                    )}
                                </div>

                                {/* Alamat */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Alamat
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.alamat}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, alamat: e.target.value })}
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    ) : (
                                        <p className="text-foreground text-lg">{profile.alamat}</p>
                                    )}
                                </div>

                                {/* Blok & No Rumah */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground">Blok</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.blok}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, blok: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-foreground text-lg">{profile.blok}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground">No. Rumah</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedProfile.no_rumah}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, no_rumah: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-foreground text-lg">{profile.no_rumah}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <LogOut className="h-5 w-5 text-red-500" />
                                Konfirmasi Logout
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Apakah Anda yakin ingin keluar dari akun ini?
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="flex-1"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Ya, Logout
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
