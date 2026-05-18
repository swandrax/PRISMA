"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    ClipboardCheck,
    Shield,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileText,
    Download,
    Plus,
    Award
} from "lucide-react"
import { calculateAuditScore, AuditRecord, AuditFinding } from "@/lib/strategic-recommendations"

// Mock data for audit records
const mockAuditRecords: AuditRecord[] = [
    {
        id: '1',
        quarter: 'Q4-2025',
        year: 2025,
        auditDate: '2025-12-31',
        auditors: ['Bapak Ahmad Suryanto', 'Ibu Siti Rahayu'],
        findings: [
            {
                category: 'Dokumentasi',
                description: 'Beberapa kwitansi pengeluaran kecil tidak memiliki tanda tangan.',
                severity: 'low',
                recommendation: 'Pastikan semua kwitansi ditandatangani oleh penerima dan pengelola.',
                resolved: true
            },
            {
                category: 'Pencatatan',
                description: 'Pencatatan iuran bulan Oktober terlambat 3 hari.',
                severity: 'low',
                recommendation: 'Buat reminder otomatis untuk pencatatan di akhir bulan.',
                resolved: true
            }
        ],
        status: 'completed',
        signedBy: 'Ketua RT - Bapak R Erry Adu Sundaru'
    },
    {
        id: '2',
        quarter: 'Q1-2026',
        year: 2026,
        auditDate: '2026-03-31',
        auditors: [],
        findings: [],
        status: 'scheduled'
    },
    {
        id: '3',
        quarter: 'Q2-2026',
        year: 2026,
        auditDate: '2026-06-30',
        auditors: [],
        findings: [],
        status: 'scheduled'
    }
];

const availableAuditors = [
    'Bapak Ahmad Suryanto',
    'Ibu Siti Rahayu',
    'Bapak Dedy Kurniawan',
    'Ibu Endang Susanti',
    'Bapak Farid Hidayat'
];

export default function AuditPage() {
    const [audits, setAudits] = useState<AuditRecord[]>(mockAuditRecords);
    const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(mockAuditRecords[0]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);

    const completedAudits = audits.filter(a => a.status === 'completed');
    const upcomingAudits = audits.filter(a => a.status === 'scheduled');
    const inProgressAudits = audits.filter(a => a.status === 'in_progress');

    const averageScore = completedAudits.length > 0
        ? completedAudits.reduce((sum, a) => sum + calculateAuditScore(a), 0) / completedAudits.length
        : 0;

    const handleAssignAuditors = () => {
        if (!selectedAudit || selectedAuditors.length < 2) {
            alert('Pilih minimal 2 auditor independen');
            return;
        }

        setAudits(audits.map(a =>
            a.id === selectedAudit.id
                ? { ...a, auditors: selectedAuditors, status: 'in_progress' as const }
                : a
        ));
        setShowAssignModal(false);
        setSelectedAuditors([]);
    };

    const getStatusBadge = (status: AuditRecord['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" /> Selesai
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-3 w-3" /> Berlangsung
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <Calendar className="h-3 w-3" /> Terjadwal
                    </span>
                );
        }
    };

    const getSeverityBadge = (severity: AuditFinding['severity']) => {
        switch (severity) {
            case 'high':
                return (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Tinggi
                    </span>
                );
            case 'medium':
                return (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Sedang
                    </span>
                );
            case 'low':
                return (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Rendah
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/laporan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <ClipboardCheck className="h-3 w-3" /> Rekomendasi #4
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Beta
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Audit Berkala</h1>
                        <p className="text-muted-foreground">Audit internal kuartalan dengan pengawas independen</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
                        <CardContent className="p-4">
                            <Award className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-green-100 text-sm">Skor Rata-rata</p>
                            <p className="text-3xl font-bold">{averageScore.toFixed(0)}%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
                        <CardContent className="p-4">
                            <CheckCircle className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-blue-100 text-sm">Audit Selesai</p>
                            <p className="text-3xl font-bold">{completedAudits.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white">
                        <CardContent className="p-4">
                            <Clock className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-amber-100 text-sm">Sedang Berjalan</p>
                            <p className="text-3xl font-bold">{inProgressAudits.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-slate-600 to-slate-700 border-0 text-white">
                        <CardContent className="p-4">
                            <Calendar className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-slate-100 text-sm">Terjadwal</p>
                            <p className="text-3xl font-bold">{upcomingAudits.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Audit List */}
                    <div className="md:col-span-1 space-y-4">
                        <h2 className="font-semibold text-lg">Jadwal Audit</h2>
                        {audits.map((audit) => (
                            <Card
                                key={audit.id}
                                className={`
                                    cursor-pointer transition-all
                                    ${selectedAudit?.id === audit.id
                                        ? 'border-primary ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                    }
                                `}
                                onClick={() => setSelectedAudit(audit)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{audit.quarter}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(audit.auditDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </p>
                                        </div>
                                        {getStatusBadge(audit.status)}
                                    </div>
                                    {audit.status === 'completed' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-600">
                                                Skor: {calculateAuditScore(audit)}%
                                            </span>
                                        </div>
                                    )}
                                    {audit.auditors.length > 0 && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            {audit.auditors.length} auditor
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right: Audit Details */}
                    <div className="md:col-span-2 space-y-6">
                        {selectedAudit ? (
                            <>
                                {/* Audit Header */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">{selectedAudit.quarter}</CardTitle>
                                                <CardDescription className="text-amber-100">
                                                    Tahun {selectedAudit.year}
                                                </CardDescription>
                                            </div>
                                            {selectedAudit.status === 'completed' && (
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold">{calculateAuditScore(selectedAudit)}%</div>
                                                    <div className="text-xs text-amber-100">Skor Audit</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground mb-1">Tanggal Audit</p>
                                                <p className="font-medium">
                                                    {new Date(selectedAudit.auditDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                                <p className="font-medium">{getStatusBadge(selectedAudit.status)}</p>
                                            </div>
                                        </div>

                                        {/* Auditors */}
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    Tim Auditor
                                                </h4>
                                                {selectedAudit.status === 'scheduled' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setShowAssignModal(true)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Assign Auditor
                                                    </Button>
                                                )}
                                            </div>
                                            {selectedAudit.auditors.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedAudit.auditors.map((auditor, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-primary">
                                                                    {auditor.split(' ').map(n => n[0]).join('')}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm">{auditor}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Belum ada auditor yang ditugaskan. Minimal 2 warga sebagai pengawas independen.
                                                </p>
                                            )}
                                        </div>

                                        {/* Findings */}
                                        {selectedAudit.status === 'completed' && (
                                            <div className="space-y-4">
                                                <h4 className="font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Temuan Audit ({selectedAudit.findings.length})
                                                </h4>
                                                {selectedAudit.findings.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {selectedAudit.findings.map((finding, index) => (
                                                            <div key={index} className="p-4 border rounded-lg">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{finding.category}</span>
                                                                        {getSeverityBadge(finding.severity)}
                                                                    </div>
                                                                    {finding.resolved ? (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                                            <CheckCircle className="h-3 w-3" /> Resolved
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                                                            <AlertTriangle className="h-3 w-3" /> Open
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    {finding.description}
                                                                </p>
                                                                <p className="text-sm">
                                                                    <strong>Rekomendasi:</strong> {finding.recommendation}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                        <p className="font-medium text-green-700 dark:text-green-400">
                                                            Tidak ada temuan signifikan
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Signature */}
                                                {selectedAudit.signedBy && (
                                                    <div className="p-4 border-t mt-4 text-center">
                                                        <p className="text-sm text-muted-foreground mb-1">Disahkan oleh</p>
                                                        <p className="font-medium">{selectedAudit.signedBy}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                {selectedAudit.status === 'completed' && (
                                    <Button variant="outline" className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Laporan Audit PDF
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Card className="border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">Pilih Audit</h3>
                                    <p className="text-muted-foreground">
                                        Pilih periode audit di sebelah kiri untuk melihat detail
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Assign Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Assign Tim Auditor</CardTitle>
                                <CardDescription>
                                    Pilih minimal 2 warga sebagai pengawas independen untuk {selectedAudit?.quarter}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {availableAuditors.map((auditor) => (
                                        <label
                                            key={auditor}
                                            className={`
                                                flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                                                ${selectedAuditors.includes(auditor) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAuditors.includes(auditor)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAuditors([...selectedAuditors, auditor]);
                                                    } else {
                                                        setSelectedAuditors(selectedAuditors.filter(a => a !== auditor));
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <span>{auditor}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={handleAssignAuditors}
                                        disabled={selectedAuditors.length < 2}
                                    >
                                        Assign ({selectedAuditors.length} dipilih)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAssignModal(false);
                                            setSelectedAuditors([]);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Info */}
                <Card className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                                    Tentang Audit Berkala
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Audit internal dilakukan setiap kuartal untuk memastikan transparansi dan akuntabilitas keuangan RT.
                                    Minimal 2 warga ditunjuk sebagai auditor independen yang tidak memiliki hubungan langsung dengan pengelolaan keuangan.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
