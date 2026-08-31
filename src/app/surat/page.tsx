"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    FileDown,
    FileText,
    Shield,
    Folder,
    Search,
    AlertTriangle,
    CheckCircle,
    ChevronRight
} from "lucide-react"
import { SuratAssistant } from "@/components/surat/surat-assistant"
import { useSuratViewModel } from "@/viewmodels/useSuratViewModel"

export default function SuratPage() {
    // ViewModel — single source of truth for surat data
    const {
        filteredTemplates: vmFilteredTemplates,
        isLoading: loading,
        getDownloadUrl,
    } = useSuratViewModel();

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: 'Semua', icon: Folder },
        { id: 'administrasi', label: 'Administrasi', icon: FileText },
        { id: 'keamanan', label: 'Keamanan', icon: Shield },
    ];

    // Local search filter on top of ViewModel data
    const filteredTemplates = vmFilteredTemplates.filter(t => {
        const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
        const matchesSearch = !searchQuery.trim() ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleDownload = (templateId: string, format: 'docx' | 'pdf') => {
        const downloadPath = getDownloadUrl(templateId, format);
        const link = document.createElement('a');
        link.href = downloadPath;
        link.download = `${templateId}.${format}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild className="border border-white/20 text-white hover:bg-white/10 bg-transparent">
                        <Link href="/#admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Layanan Surat Menyurat</h1>
                        <p className="text-purple-200">Download template dan ajukan surat secara online</p>
                    </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0 text-white cursor-pointer hover:scale-[1.02] transition-transform">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-xl">
                                <Folder className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">Subfolder Administrasi</h3>
                                <p className="text-purple-200 text-sm">Template surat administrasi umum</p>
                            </div>
                            <ChevronRight className="h-6 w-6" />
                        </CardContent>
                    </Card>

                    <Link href="/surat/keamanan">
                        <Card className="bg-gradient-to-br from-red-600 to-red-800 border-0 text-white cursor-pointer hover:scale-[1.02] transition-transform">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-xl">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Laporan Keamanan</h3>
                                    <p className="text-red-200 text-sm">Laporkan kejadian keamanan</p>
                                </div>
                                <ChevronRight className="h-6 w-6" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari template surat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? "default" : "ghost"}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={activeCategory === cat.id
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "border border-white/20 text-white hover:bg-white/10 bg-transparent"
                                    }
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {cat.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 rounded-lg bg-purple-500/20">
                                        <FileText className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-white text-base">{template.title}</CardTitle>
                                        <CardDescription className="text-gray-400 text-sm mt-1">
                                            {template.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-purple-200/70 mb-3">
                                    Field diperlukan: {template.requiredFields.join(', ')}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-white/10 pt-4 flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={() => handleDownload(template.id, 'docx')}
                                >
                                    <FileDown className="h-4 w-4 mr-1" />
                                    .docx
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="flex-1 border border-white/20 text-white hover:bg-white/10 bg-transparent"
                                    onClick={() => handleDownload(template.id, 'pdf')}
                                >
                                    <FileDown className="h-4 w-4 mr-1" />
                                    .pdf
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white">Tidak ada template ditemukan</h3>
                        <p className="text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                )}

                {/* Info Section */}
                <Card className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <CheckCircle className="h-8 w-8 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-lg">Cara Menggunakan Template</h4>
                                <ul className="mt-2 space-y-2 text-purple-200">
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">1</span>
                                        Download template dalam format .docx atau .pdf
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">2</span>
                                        Isi field yang diperlukan sesuai kebutuhan
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">3</span>
                                        Cetak dan serahkan ke sekretariat RT untuk ditandatangani
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">4</span>
                                        Ambil surat yang sudah jadi dalam 1-2 hari kerja
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* AI Assistant */}
                <SuratAssistant onFilter={(query: string) => {
                    setSearchQuery(query);
                    // Optionally scroll to top or show a toast
                }} />
            </div>
        </div>
    );
}
