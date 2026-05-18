"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    Plus,
    Save,
    Trash2,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Lightbulb,
    Calculator,
    PieChart,
    BarChart3,
    RefreshCw,
    Calendar,
    DollarSign,
    Target,
    Activity,
    Zap,
    Brain,
    Eye,
    Download,
    Settings,
    AlertTriangle
} from "lucide-react"
import { formatCurrency, calculateVariance } from "@/lib/financial-utils"

// Types
interface CustomTransaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: string;
    tipe: 'pemasukan' | 'pengeluaran';
    jumlah: number;
}

interface BudgetAllocation {
    kategori: string;
    target: number;
    actual: number;
    color: string;
}

interface AIRecommendation {
    type: 'success' | 'warning' | 'info' | 'danger';
    title: string;
    message: string;
    priority: number;
}

// Categories
const EXPENSE_CATEGORIES = ['Kebersihan', 'Operasional', 'Fasilitas', 'Keamanan', 'Event', 'Lainnya'];
const INCOME_CATEGORIES = ['Iuran', 'Donasi', 'Lainnya'];

// Default budget allocations
const DEFAULT_BUDGET: BudgetAllocation[] = [
    { kategori: 'Kebersihan', target: 250000, actual: 0, color: 'bg-green-500' },
    { kategori: 'Operasional', target: 100000, actual: 0, color: 'bg-blue-500' },
    { kategori: 'Fasilitas', target: 100000, actual: 0, color: 'bg-purple-500' },
    { kategori: 'Keamanan', target: 50000, actual: 0, color: 'bg-amber-500' },
    { kategori: 'Event', target: 100000, actual: 0, color: 'bg-rose-500' },
    { kategori: 'Lainnya', target: 50000, actual: 0, color: 'bg-gray-500' },
];

export default function CustomKeuanganPage() {
    // State
    const [transactions, setTransactions] = useState<CustomTransaction[]>([]);
    const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>(DEFAULT_BUDGET);
    const [saldoAwal, setSaldoAwal] = useState<number>(3850000);
    const [periode, setPeriode] = useState<string>('Februari 2026');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
    const [showBudgetSettings, setShowBudgetSettings] = useState(false);

    // New transaction form
    const [newTransaction, setNewTransaction] = useState<Partial<CustomTransaction>>({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        kategori: 'Iuran',
        tipe: 'pemasukan',
        jumlah: 0
    });

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('custom_transactions');
        const savedBudget = localStorage.getItem('custom_budget');
        const savedSaldo = localStorage.getItem('custom_saldo_awal');
        const savedPeriode = localStorage.getItem('custom_periode');

        if (saved) setTransactions(JSON.parse(saved));
        if (savedBudget) setBudgetAllocations(JSON.parse(savedBudget));
        if (savedSaldo) setSaldoAwal(JSON.parse(savedSaldo));
        if (savedPeriode) setPeriode(savedPeriode);
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('custom_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('custom_budget', JSON.stringify(budgetAllocations));
    }, [budgetAllocations]);

    // Real-time calculations
    const analysis = useMemo(() => {
        const totalPemasukan = transactions
            .filter(t => t.tipe === 'pemasukan')
            .reduce((sum, t) => sum + t.jumlah, 0);

        const totalPengeluaran = transactions
            .filter(t => t.tipe === 'pengeluaran')
            .reduce((sum, t) => sum + t.jumlah, 0);

        const netFlow = totalPemasukan - totalPengeluaran;
        const saldoAkhir = saldoAwal + netFlow;
        const savingsRate = totalPemasukan > 0 ? (netFlow / totalPemasukan) * 100 : 0;

        // Category breakdown for expenses
        const expenseByCategory: Record<string, number> = {};
        transactions
            .filter(t => t.tipe === 'pengeluaran')
            .forEach(t => {
                expenseByCategory[t.kategori] = (expenseByCategory[t.kategori] || 0) + t.jumlah;
            });

        // Income breakdown
        const incomeByCategory: Record<string, number> = {};
        transactions
            .filter(t => t.tipe === 'pemasukan')
            .forEach(t => {
                incomeByCategory[t.kategori] = (incomeByCategory[t.kategori] || 0) + t.jumlah;
            });

        // Budget vs Actual
        const budgetStatus = budgetAllocations.map(b => ({
            ...b,
            actual: expenseByCategory[b.kategori] || 0,
            percentage: b.target > 0 ? ((expenseByCategory[b.kategori] || 0) / b.target) * 100 : 0,
            status: (expenseByCategory[b.kategori] || 0) <= b.target ? 'on-track' : 'over-budget'
        }));

        const totalBudget = budgetAllocations.reduce((sum, b) => sum + b.target, 0);
        const budgetUtilization = totalBudget > 0 ? (totalPengeluaran / totalBudget) * 100 : 0;

        return {
            totalPemasukan,
            totalPengeluaran,
            netFlow,
            saldoAkhir,
            savingsRate,
            expenseByCategory,
            incomeByCategory,
            budgetStatus,
            budgetUtilization,
            totalBudget,
            transactionCount: transactions.length
        };
    }, [transactions, budgetAllocations, saldoAwal]);

    // AI-powered recommendations
    const recommendations = useMemo((): AIRecommendation[] => {
        const recs: AIRecommendation[] = [];

        // Positive cash flow
        if (analysis.netFlow > 0) {
            recs.push({
                type: 'success',
                title: 'Surplus Positif',
                message: `Kas RT surplus ${formatCurrency(analysis.netFlow)}. Pertimbangkan alokasi ke dana cadangan atau investasi infrastruktur.`,
                priority: 1
            });
        } else if (analysis.netFlow < 0) {
            recs.push({
                type: 'danger',
                title: 'Defisit Anggaran',
                message: `Kas RT defisit ${formatCurrency(Math.abs(analysis.netFlow))}. Evaluasi pengeluaran non-esensial dan tingkatkan pemasukan.`,
                priority: 5
            });
        }

        // Budget monitoring
        analysis.budgetStatus.forEach(b => {
            if (b.percentage > 100) {
                recs.push({
                    type: 'warning',
                    title: `Over Budget: ${b.kategori}`,
                    message: `Pengeluaran ${b.kategori} melebihi budget (${b.percentage.toFixed(0)}%). Realisasi: ${formatCurrency(b.actual)} vs Target: ${formatCurrency(b.target)}.`,
                    priority: 4
                });
            } else if (b.percentage > 80) {
                recs.push({
                    type: 'info',
                    title: `Hampir Limit: ${b.kategori}`,
                    message: `${b.kategori} sudah mencapai ${b.percentage.toFixed(0)}% dari budget. Sisa: ${formatCurrency(b.target - b.actual)}.`,
                    priority: 2
                });
            }
        });

        // Savings rate warning
        if (analysis.savingsRate < 20 && analysis.totalPemasukan > 0) {
            recs.push({
                type: 'warning',
                title: 'Savings Rate Rendah',
                message: `Tingkat tabungan hanya ${analysis.savingsRate.toFixed(1)}%. Idealnya minimal 30% untuk membangun dana cadangan.`,
                priority: 3
            });
        }

        // Low income warning
        if (analysis.totalPemasukan < 500000 && transactions.length > 0) {
            recs.push({
                type: 'info',
                title: 'Optimasi Pemasukan',
                message: 'Pemasukan bulan ini di bawah rata-rata (Rp 500.000). Pastikan semua iuran warga tercatat.',
                priority: 2
            });
        }

        // Emergency fund check
        const monthlyExpenseAvg = analysis.totalPengeluaran || 441667;
        const emergencyFundMonths = analysis.saldoAkhir / monthlyExpenseAvg;
        if (emergencyFundMonths < 3) {
            recs.push({
                type: 'warning',
                title: 'Dana Darurat Terbatas',
                message: `Saldo hanya cukup untuk ${emergencyFundMonths.toFixed(1)} bulan operasional. Target: minimal 3-6 bulan.`,
                priority: 3
            });
        }

        // No transactions warning
        if (transactions.length === 0) {
            recs.push({
                type: 'info',
                title: 'Mulai Input Data',
                message: 'Belum ada transaksi. Tambahkan pemasukan dan pengeluaran untuk mendapatkan analisis real-time.',
                priority: 1
            });
        }

        return recs.sort((a, b) => b.priority - a.priority);
    }, [analysis, transactions.length]);

    // Add transaction handler
    const addTransaction = () => {
        if (!newTransaction.keterangan || !newTransaction.jumlah) {
            alert('Mohon lengkapi keterangan dan jumlah');
            return;
        }

        const transaction: CustomTransaction = {
            // eslint-disable-next-line react-hooks/purity
            id: `TRX-${Date.now()}`,
            tanggal: newTransaction.tanggal || new Date().toISOString().split('T')[0],
            keterangan: newTransaction.keterangan || '',
            kategori: newTransaction.kategori || 'Lainnya',
            tipe: newTransaction.tipe || 'pemasukan',
            jumlah: newTransaction.jumlah || 0
        };

        setTransactions(prev => [...prev, transaction]);

        // Reset form
        setNewTransaction({
            tanggal: new Date().toISOString().split('T')[0],
            keterangan: '',
            kategori: newTransaction.tipe === 'pemasukan' ? 'Iuran' : 'Kebersihan',
            tipe: newTransaction.tipe,
            jumlah: 0
        });

        // Trigger analysis
        triggerAnalysis();
    };

    // Delete transaction
    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        triggerAnalysis();
    };

    // Update budget allocation
    const updateBudget = (kategori: string, value: number) => {
        setBudgetAllocations(prev =>
            prev.map(b => b.kategori === kategori ? { ...b, target: value } : b)
        );
    };

    // Trigger real-time analysis
    const triggerAnalysis = useCallback(() => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setLastAnalysis(new Date());
        }, 500);
    }, []);

    // Export data
    const exportData = () => {
        const data = {
            periode,
            saldoAwal,
            transactions,
            analysis: {
                totalPemasukan: analysis.totalPemasukan,
                totalPengeluaran: analysis.totalPengeluaran,
                netFlow: analysis.netFlow,
                saldoAkhir: analysis.saldoAkhir
            },
            budgetAllocations,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-keuangan-${periode.replace(' ', '-').toLowerCase()}.json`;
        a.click();
    };

    // Clear all data
    const clearAllData = () => {
        if (confirm('Hapus semua data transaksi? Tindakan ini tidak dapat dibatalkan.')) {
            setTransactions([]);
            localStorage.removeItem('custom_transactions');
        }
    };

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'danger': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Lightbulb className="h-5 w-5 text-blue-500" />;
        }
    };

    const getRecommendationStyle = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
            case 'warning': return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10';
            case 'danger': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
        }
    };

    return (
        <div className="min-h-screen bg-background py-8 transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/keuangan/laporan">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Calculator className="h-6 w-6 text-primary" />
                                Custom Input Keuangan
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Input manual dengan analisis real-time
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lastAnalysis && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                Update: {lastAnalysis.toLocaleTimeString()}
                            </span>
                        )}
                        <Button variant="outline" size="sm" onClick={triggerAnalysis} disabled={isAnalyzing}>
                            <RefreshCw className={`h-4 w-4 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportData}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Period & Initial Balance Settings */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Periode Laporan</Label>
                                <Input
                                    value={periode}
                                    onChange={(e) => {
                                        setPeriode(e.target.value);
                                        localStorage.setItem('custom_periode', e.target.value);
                                    }}
                                    placeholder="Februari 2026"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Saldo Awal</Label>
                                <Input
                                    type="number"
                                    value={saldoAwal}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setSaldoAwal(val);
                                        localStorage.setItem('custom_saldo_awal', JSON.stringify(val));
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowBudgetSettings(!showBudgetSettings)}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Budget Settings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Settings Panel */}
                {showBudgetSettings && (
                    <Card className="mb-6 border-dashed border-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Pengaturan Target Budget Bulanan
                            </CardTitle>
                            <CardDescription>Atur target anggaran per kategori untuk monitoring</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {budgetAllocations.map((budget) => (
                                    <div key={budget.kategori} className="space-y-1">
                                        <Label className="text-xs">{budget.kategori}</Label>
                                        <Input
                                            type="number"
                                            value={budget.target}
                                            onChange={(e) => updateBudget(budget.kategori, parseInt(e.target.value) || 0)}
                                            className="text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Real-time Dashboard */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-100">Saldo Akhir</p>
                                    <p className="text-2xl font-bold text-white drop-shadow-sm">{formatCurrency(analysis.saldoAkhir)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`border-l-4 ${analysis.netFlow >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                                    <p className={`text-2xl font-bold ${analysis.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {analysis.netFlow >= 0 ? '+' : ''}{formatCurrency(analysis.netFlow)}
                                    </p>
                                </div>
                                {analysis.netFlow >= 0 ? <TrendingUp className="h-8 w-8 text-green-500" /> : <TrendingDown className="h-8 w-8 text-red-500" />}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Budget Utilization</p>
                                    <p className="text-2xl font-bold">{analysis.budgetUtilization.toFixed(0)}%</p>
                                    <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${analysis.budgetUtilization > 100 ? 'bg-red-500' : analysis.budgetUtilization > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(analysis.budgetUtilization, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <PieChart className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-violet-600 to-purple-700 border-0 text-white shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-violet-100">Savings Rate</p>
                                    <p className="text-2xl font-bold text-white drop-shadow-sm">{analysis.savingsRate.toFixed(1)}%</p>
                                </div>
                                <Target className="h-8 w-8 text-violet-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Input Form & Transactions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add Transaction Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-primary" />
                                    Tambah Transaksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Transaction Type Toggle */}
                                <div className="flex gap-2">
                                    <Button
                                        className={`flex-1 font-semibold ${newTransaction.tipe === 'pemasukan'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                                : 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        variant={newTransaction.tipe === 'pemasukan' ? 'default' : 'outline'}
                                        onClick={() => setNewTransaction(prev => ({ ...prev, tipe: 'pemasukan', kategori: 'Iuran' }))}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Pemasukan
                                    </Button>
                                    <Button
                                        className={`flex-1 font-semibold ${newTransaction.tipe === 'pengeluaran'
                                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                                                : 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        variant={newTransaction.tipe === 'pengeluaran' ? 'default' : 'outline'}
                                        onClick={() => setNewTransaction(prev => ({ ...prev, tipe: 'pengeluaran', kategori: 'Kebersihan' }))}
                                    >
                                        <TrendingDown className="h-4 w-4 mr-2" />
                                        Pengeluaran
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tanggal</Label>
                                        <Input
                                            type="date"
                                            value={newTransaction.tanggal}
                                            onChange={(e) => setNewTransaction(prev => ({ ...prev, tanggal: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Kategori</Label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                                            value={newTransaction.kategori}
                                            onChange={(e) => setNewTransaction(prev => ({ ...prev, kategori: e.target.value }))}
                                        >
                                            {(newTransaction.tipe === 'pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Keterangan</Label>
                                    <Textarea
                                        placeholder="Deskripsi transaksi..."
                                        value={newTransaction.keterangan}
                                        onChange={(e) => setNewTransaction(prev => ({ ...prev, keterangan: e.target.value }))}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label>Jumlah (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newTransaction.jumlah || ''}
                                        onChange={(e) => setNewTransaction(prev => ({ ...prev, jumlah: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>

                                <Button className="w-full" onClick={addTransaction}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Simpan Transaksi
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Transaction List */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Daftar Transaksi</CardTitle>
                                    <CardDescription>{transactions.length} transaksi tercatat</CardDescription>
                                </div>
                                {transactions.length > 0 && (
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={clearAllData}>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Hapus Semua
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {transactions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Belum ada transaksi</p>
                                        <p className="text-sm">Tambahkan transaksi pertama Anda</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {[...transactions].reverse().map((trx) => (
                                            <div
                                                key={trx.id}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${trx.tipe === 'pemasukan' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <div>
                                                        <p className="font-medium text-sm">{trx.keterangan}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {trx.tanggal} • {trx.kategori}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold text-sm ${trx.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {trx.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(trx.jumlah)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-red-500"
                                                        onClick={() => deleteTransaction(trx.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Analysis & Recommendations */}
                    <div className="space-y-6">
                        {/* AI Recommendations */}
                        <Card className="border-2 border-primary/20">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    AI Analisis & Saran
                                    {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin ml-auto" />}
                                </CardTitle>
                                <CardDescription>Rekomendasi real-time berdasarkan data</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {recommendations.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Tambahkan transaksi untuk mendapatkan analisis
                                    </p>
                                ) : (
                                    recommendations.slice(0, 5).map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border-l-4 ${getRecommendationStyle(rec.type)}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {getRecommendationIcon(rec.type)}
                                                <div>
                                                    <p className="font-medium text-sm">{rec.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{rec.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Budget Monitoring */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-amber-500" />
                                    Monitoring Budget
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.budgetStatus.map((budget) => (
                                    <div key={budget.kategori} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{budget.kategori}</span>
                                            <span className={budget.percentage > 100 ? 'text-red-600' : ''}>
                                                {formatCurrency(budget.actual)} / {formatCurrency(budget.target)}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${budget.percentage > 100 ? 'bg-red-500' :
                                                    budget.percentage > 80 ? 'bg-amber-500' :
                                                        'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            {budget.percentage.toFixed(0)}%
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Rangkuman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                    <span className="text-sm">Total Pemasukan</span>
                                    <span className="font-bold text-green-600">{formatCurrency(analysis.totalPemasukan)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                    <span className="text-sm">Total Pengeluaran</span>
                                    <span className="font-bold text-red-600">{formatCurrency(analysis.totalPengeluaran)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <span className="text-sm">Total Budget</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(analysis.totalBudget)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
