"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Download,
    TrendingUp,
    TrendingDown,
    Calendar,
    FileText,
    PieChart,
    ChevronDown,
    ChevronUp,
    Printer,
    AlertCircle,
    BarChart3,
    Lightbulb,
    Target,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    DollarSign,
    Activity,
    Calculator
} from "lucide-react"
import { formatCurrency, calculateVariance } from "@/lib/financial-utils"
import KeuanganLoading from "@/app/keuangan/loading"

interface Transaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: string;
    tipe: 'pemasukan' | 'pengeluaran';
    jumlah: number;
    noSurat?: string;
}

interface MonthlyReport {
    bulan: string;
    tahun: number;
    saldo_awal: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo_akhir: number;
    transaksi: Transaction[];
    keterangan_lpj?: string;
}

interface ExpenseCategory {
    kategori: string;
    persentase: number;
    avgBulanan: number;
    keterangan: string;
}

interface FinancialAnalysis {
    totalPemasukan: number;
    totalPengeluaran: number;
    netCashFlow: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    savingsRate: number;
    growthRate: number;
    highestExpenseMonth: { bulan: string; tahun: number; amount: number } | null;
    lowestExpenseMonth: { bulan: string; tahun: number; amount: number } | null;
    categoryBreakdown: { kategori: string; total: number; percentage: number }[];
    incomeBreakdown: { kategori: string; total: number; percentage: number }[];
    monthlyTrend: { period: string; pemasukan: number; pengeluaran: number; netFlow: number }[];
}

export default function LaporanKeuanganPage() {
    const [selectedMonth, setSelectedMonth] = useState<MonthlyReport | null>(null);
    const [prevMonth, setPrevMonth] = useState<MonthlyReport | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<MonthlyReport[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [avgExpense, setAvgExpense] = useState(441667);
    const [activeTab, setActiveTab] = useState<'bulanan' | 'analisis' | 'kesimpulan'>('bulanan');

    useEffect(() => {
        async function loadData() {
            try {
                // Use repository instead of direct JSON fetch
                const { getKeuanganRepository } = await import('@/models/repositories/KeuanganRepository');
                const repo = getKeuanganRepository();

                const [reportEntities, expSummary] = await Promise.all([
                    repo.getAll(),
                    repo.getExpenseSummary(),
                ]);

                // Map entity fields (camelCase) to page's expected shape (snake_case)
                const mappedReports: MonthlyReport[] = reportEntities.map(r => ({
                    bulan: r.bulan,
                    tahun: r.tahun,
                    saldo_awal: r.saldoAwal,
                    total_pemasukan: r.totalPemasukan,
                    total_pengeluaran: r.totalPengeluaran,
                    saldo_akhir: r.saldoAkhir,
                    transaksi: r.transaksi.map(t => ({
                        id: t.id,
                        tanggal: t.tanggal,
                        keterangan: t.keterangan,
                        kategori: t.kategori,
                        tipe: t.tipe,
                        jumlah: t.jumlah,
                    })),
                }));

                setReports(mappedReports);
                if (mappedReports.length > 0) {
                    setSelectedMonth(mappedReports[0]);
                    setExpandedMonth(`${mappedReports[0].bulan}-${mappedReports[0].tahun}`);
                    if (mappedReports.length > 1) {
                        setPrevMonth(mappedReports[1]);
                    }
                }

                setExpenseCategories(expSummary.categories.map(c => ({
                    kategori: c.kategori,
                    persentase: c.persentase,
                    avgBulanan: c.avgBulanan,
                    keterangan: c.keterangan,
                })));
                setAvgExpense(expSummary.avgMonthlyExpense);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Comprehensive Financial Analysis
    const analysis: FinancialAnalysis = useMemo(() => {
        if (reports.length === 0) {
            return {
                totalPemasukan: 0,
                totalPengeluaran: 0,
                netCashFlow: 0,
                avgMonthlyIncome: 0,
                avgMonthlyExpense: 0,
                savingsRate: 0,
                growthRate: 0,
                highestExpenseMonth: null,
                lowestExpenseMonth: null,
                categoryBreakdown: [],
                incomeBreakdown: [],
                monthlyTrend: [],
            };
        }

        const totalPemasukan = reports.reduce((sum, r) => sum + r.total_pemasukan, 0);
        const totalPengeluaran = reports.reduce((sum, r) => sum + r.total_pengeluaran, 0);
        const netCashFlow = totalPemasukan - totalPengeluaran;
        const avgMonthlyIncome = totalPemasukan / reports.length;
        const avgMonthlyExpense = totalPengeluaran / reports.length;
        const savingsRate = totalPemasukan > 0 ? ((totalPemasukan - totalPengeluaran) / totalPemasukan) * 100 : 0;

        // Growth rate (first vs last month)
        const firstMonth = reports[reports.length - 1];
        const lastMonth = reports[0];
        const growthRate = firstMonth.saldo_akhir > 0
            ? ((lastMonth.saldo_akhir - firstMonth.saldo_akhir) / firstMonth.saldo_akhir) * 100
            : 0;

        // Find highest and lowest expense months
        let highestExpenseMonth = reports[0];
        let lowestExpenseMonth = reports[0];
        reports.forEach(r => {
            if (r.total_pengeluaran > highestExpenseMonth.total_pengeluaran) highestExpenseMonth = r;
            if (r.total_pengeluaran < lowestExpenseMonth.total_pengeluaran) lowestExpenseMonth = r;
        });

        // Category breakdown for all expenses
        const categoryMap: Record<string, number> = {};
        const incomeMap: Record<string, number> = {};
        reports.forEach(r => {
            r.transaksi.forEach(t => {
                if (t.tipe === 'pengeluaran') {
                    categoryMap[t.kategori] = (categoryMap[t.kategori] || 0) + t.jumlah;
                } else {
                    incomeMap[t.kategori] = (incomeMap[t.kategori] || 0) + t.jumlah;
                }
            });
        });

        const categoryBreakdown = Object.entries(categoryMap)
            .map(([kategori, total]) => ({
                kategori,
                total,
                percentage: (total / totalPengeluaran) * 100
            }))
            .sort((a, b) => b.total - a.total);

        const incomeBreakdown = Object.entries(incomeMap)
            .map(([kategori, total]) => ({
                kategori,
                total,
                percentage: (total / totalPemasukan) * 100
            }))
            .sort((a, b) => b.total - a.total);

        // Monthly trend (reversed for chronological order)
        const monthlyTrend = [...reports].reverse().map(r => ({
            period: `${r.bulan.substring(0, 3)} ${r.tahun}`,
            pemasukan: r.total_pemasukan,
            pengeluaran: r.total_pengeluaran,
            netFlow: r.total_pemasukan - r.total_pengeluaran
        }));

        return {
            totalPemasukan,
            totalPengeluaran,
            netCashFlow,
            avgMonthlyIncome,
            avgMonthlyExpense,
            savingsRate,
            growthRate,
            highestExpenseMonth: { bulan: highestExpenseMonth.bulan, tahun: highestExpenseMonth.tahun, amount: highestExpenseMonth.total_pengeluaran },
            lowestExpenseMonth: { bulan: lowestExpenseMonth.bulan, tahun: lowestExpenseMonth.tahun, amount: lowestExpenseMonth.total_pengeluaran },
            categoryBreakdown,
            incomeBreakdown,
            monthlyTrend,
        };
    }, [reports]);

    const handleDownloadPdf = (bulan: string, tahun: number) => {
        window.open(`/api/database/keuangan/pdf?bulan=${bulan}&tahun=${tahun}`, '_blank');
    };

    const toggleMonth = (monthKey: string, report: MonthlyReport, index: number) => {
        if (expandedMonth === monthKey) {
            setExpandedMonth(null);
        } else {
            setExpandedMonth(monthKey);
            setSelectedMonth(report);
            if (index + 1 < reports.length) {
                setPrevMonth(reports[index + 1]);
            } else {
                setPrevMonth(null);
            }
        }
    };

    if (loading) {
        return <KeuanganLoading />;
    }

    const expensesVariance = selectedMonth && prevMonth
        ? calculateVariance(selectedMonth.total_pengeluaran, prevMonth.total_pengeluaran)
        : { percent: 0, isIncrease: false };

    return (
        <div className="min-h-screen bg-background py-8 transition-colors duration-500">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/#admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-foreground">Laporan Keuangan RT 04</h1>
                        <p className="text-muted-foreground">Transparansi pengelolaan dana warga • Periode Juli 2025 - Maret 2026</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    <Button
                        variant={activeTab === 'bulanan' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('bulanan')}
                        className="rounded-full"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Laporan Bulanan
                    </Button>
                    <Button
                        variant={activeTab === 'analisis' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('analisis')}
                        className="rounded-full"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analisis Data
                    </Button>
                    <Button
                        variant={activeTab === 'kesimpulan' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('kesimpulan')}
                        className="rounded-full"
                    >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Kesimpulan & Rekomendasi
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary"
                    >
                        <Link href="/keuangan/custom">
                            <Calculator className="h-4 w-4 mr-2" />
                            Custom Input
                        </Link>
                    </Button>
                </div>

                {/* ===================== TAB: LAPORAN BULANAN ===================== */}
                {activeTab === 'bulanan' && (
                    <>
                        {/* Current Balance Summary */}
                        <div className="grid gap-4 md:grid-cols-4 mb-8">
                            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white shadow-xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-100">Saldo Saat Ini</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white drop-shadow-sm">{formatCurrency(selectedMonth?.saldo_akhir || 0)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card text-card-foreground border shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Pemasukan Bulan Ini
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">+ {formatCurrency(selectedMonth?.total_pemasukan || 0)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card text-card-foreground border shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                            Pengeluaran Bulan Ini
                                        </CardTitle>
                                        {prevMonth && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${expensesVariance.isIncrease ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                                                {expensesVariance.isIncrease ? '↑' : '↓'} {expensesVariance.percent}%
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">- {formatCurrency(selectedMonth?.total_pengeluaran || 0)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white shadow-xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
                                        <PieChart className="h-4 w-4 text-amber-100" />
                                        Rata-rata Pengeluaran
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white drop-shadow-sm">{formatCurrency(avgExpense)}</div>
                                    <div className="text-xs text-amber-100">per bulan</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Variance Alert */}
                        {prevMonth && expensesVariance.percent > 5 && (
                            <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                                <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/20">
                                    <CardContent className="p-4 flex gap-4 items-start">
                                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-amber-700 dark:text-amber-400">Analisis Variansi Pengeluaran</h3>
                                            <p className="text-sm text-amber-600/80 dark:text-amber-300/80 mt-1">
                                                Terdeteksi perubahan pengeluaran sebesar <strong>{expensesVariance.percent}%</strong> dibandingkan bulan lalu ({prevMonth.bulan}).
                                                {expensesVariance.isIncrease
                                                    ? " Peningkatan ini perlu ditinjau apakah disebabkan oleh kegiatan insidental atau kenaikan biaya rutin."
                                                    : " Penurunan ini menunjukkan efisiensi anggaran bulan ini."
                                                }
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Monthly Reports */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Laporan Bulanan
                                </h2>

                                {reports.map((report, index) => {
                                    const monthKey = `${report.bulan}-${report.tahun}`;
                                    const isExpanded = expandedMonth === monthKey;

                                    return (
                                        <Card key={monthKey} className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
                                            <div
                                                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => toggleMonth(monthKey, report, index)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <FileText className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">{report.bulan} {report.tahun}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {report.transaksi.length} transaksi
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-green-600 dark:text-green-400 text-sm font-medium">+ {formatCurrency(report.total_pemasukan)}</div>
                                                            <div className="text-red-600 dark:text-red-400 text-sm font-medium">- {formatCurrency(report.total_pengeluaran)}</div>
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t">
                                                    <div className="p-4 bg-muted/30">
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div className="bg-background rounded-lg p-3 border shadow-sm">
                                                                <div className="text-xs text-muted-foreground">Saldo Awal</div>
                                                                <div className="text-foreground font-semibold">{formatCurrency(report.saldo_awal)}</div>
                                                            </div>
                                                            <div className="bg-background rounded-lg p-3 border shadow-sm">
                                                                <div className="text-xs text-muted-foreground">Saldo Akhir</div>
                                                                <div className="text-primary font-semibold">{formatCurrency(report.saldo_akhir)}</div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {report.transaksi.map((trx) => (
                                                                <div
                                                                    key={trx.id}
                                                                    className="flex items-center justify-between p-3 rounded-lg bg-background border hover:shadow-sm transition-shadow"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${trx.tipe === 'pemasukan' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                        <div>
                                                                            <div className="text-foreground text-sm font-medium">{trx.keterangan}</div>
                                                                            <div className="text-xs text-muted-foreground">{trx.tanggal} • {trx.kategori} {trx.noSurat && `• ${trx.noSurat}`}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`font-semibold text-sm ${trx.tipe === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                        {trx.tipe === 'pemasukan' ? '+' : '-'} {formatCurrency(trx.jumlah)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border-t flex gap-2 bg-background">
                                                        <Button
                                                            className="flex-1"
                                                            onClick={() => handleDownloadPdf(report.bulan, report.tahun)}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download PDF
                                                        </Button>
                                                        <Button variant="outline" onClick={() => handleDownloadPdf(report.bulan, report.tahun)}>
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Expense Summary */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-amber-500" />
                                    Distribusi Pengeluaran
                                </h2>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Rata-rata Bulanan</CardTitle>
                                        <CardDescription>
                                            Total: {formatCurrency(avgExpense)} per bulan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {expenseCategories.map((cat, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-foreground">{cat.kategori}</span>
                                                    <span className="text-primary font-semibold">{cat.persentase}%</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${cat.persentase}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span className="truncate max-w-[150px]">{cat.keterangan}</span>
                                                    <span>{formatCurrency(cat.avgBulanan)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}

                {/* ===================== TAB: ANALISIS DATA ===================== */}
                {activeTab === 'analisis' && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-80">Total Pemasukan</p>
                                            <p className="text-2xl font-bold">{formatCurrency(analysis.totalPemasukan)}</p>
                                            <p className="text-xs opacity-70 mt-1">{reports.length} bulan data</p>
                                        </div>
                                        <ArrowUpRight className="h-10 w-10 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-red-500 to-rose-600 border-0 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-80">Total Pengeluaran</p>
                                            <p className="text-2xl font-bold">{formatCurrency(analysis.totalPengeluaran)}</p>
                                            <p className="text-xs opacity-70 mt-1">{reports.length} bulan data</p>
                                        </div>
                                        <ArrowDownRight className="h-10 w-10 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-80">Net Cash Flow</p>
                                            <p className="text-2xl font-bold">{formatCurrency(analysis.netCashFlow)}</p>
                                            <p className="text-xs opacity-70 mt-1">{analysis.netCashFlow >= 0 ? 'Surplus' : 'Defisit'}</p>
                                        </div>
                                        <Wallet className="h-10 w-10 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 border-0 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-80">Savings Rate</p>
                                            <p className="text-2xl font-bold">{analysis.savingsRate.toFixed(1)}%</p>
                                            <p className="text-xs opacity-70 mt-1">dari total pemasukan</p>
                                        </div>
                                        <Target className="h-10 w-10 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Tren Bulanan
                                </CardTitle>
                                <CardDescription>Perbandingan pemasukan dan pengeluaran per bulan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analysis.monthlyTrend.map((month, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">{month.period}</span>
                                                <span className={`text-sm font-semibold ${month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {month.netFlow >= 0 ? '+' : ''}{formatCurrency(month.netFlow)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 h-6">
                                                <div
                                                    className="bg-green-500 rounded-l-full h-full transition-all"
                                                    style={{ width: `${(month.pemasukan / Math.max(...analysis.monthlyTrend.map(m => m.pemasukan))) * 50}%` }}
                                                    title={`Pemasukan: ${formatCurrency(month.pemasukan)}`}
                                                />
                                                <div
                                                    className="bg-red-500 rounded-r-full h-full transition-all"
                                                    style={{ width: `${(month.pengeluaran / Math.max(...analysis.monthlyTrend.map(m => m.pengeluaran))) * 50}%` }}
                                                    title={`Pengeluaran: ${formatCurrency(month.pengeluaran)}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>📈 {formatCurrency(month.pemasukan)}</span>
                                                <span>📉 {formatCurrency(month.pengeluaran)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                        <TrendingUp className="h-5 w-5" />
                                        Breakdown Pemasukan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.incomeBreakdown.map((cat, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div>
                                                <span className="font-medium">{cat.kategori}</span>
                                                <span className="text-xs text-muted-foreground ml-2">({cat.percentage.toFixed(1)}%)</span>
                                            </div>
                                            <span className="font-bold text-green-600">{formatCurrency(cat.total)}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-600">
                                        <TrendingDown className="h-5 w-5" />
                                        Breakdown Pengeluaran
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.categoryBreakdown.map((cat, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div>
                                                <span className="font-medium">{cat.kategori}</span>
                                                <span className="text-xs text-muted-foreground ml-2">({cat.percentage.toFixed(1)}%)</span>
                                            </div>
                                            <span className="font-bold text-red-600">{formatCurrency(cat.total)}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistical Highlights */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-green-200 dark:border-green-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rata-rata Pemasukan</p>
                                            <p className="text-xl font-bold text-green-600">{formatCurrency(analysis.avgMonthlyIncome)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-red-200 dark:border-red-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <TrendingDown className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rata-rata Pengeluaran</p>
                                            <p className="text-xl font-bold text-red-600">{formatCurrency(analysis.avgMonthlyExpense)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-blue-200 dark:border-blue-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pertumbuhan Saldo</p>
                                            <p className="text-xl font-bold text-blue-600">{analysis.growthRate >= 0 ? '+' : ''}{analysis.growthRate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ===================== TAB: KESIMPULAN & REKOMENDASI ===================== */}
                {activeTab === 'kesimpulan' && (
                    <div className="space-y-8">
                        {/* Executive Summary */}
                        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <FileText className="h-6 w-6 text-primary" />
                                    Ringkasan Eksekutif
                                </CardTitle>
                                <CardDescription>Periode Juli 2025 - Maret 2026</CardDescription>
                            </CardHeader>
                            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-lg leading-relaxed">
                                    Berdasarkan analisis data keuangan RT 04 RW 09 Kemayoran selama <strong>8 bulan</strong> terakhir,
                                    kondisi kas RT menunjukkan <strong className="text-green-600">tren positif</strong> dengan
                                    total surplus sebesar <strong>{formatCurrency(analysis.netCashFlow)}</strong>.
                                    Savings rate sebesar <strong>{analysis.savingsRate.toFixed(1)}%</strong> menunjukkan
                                    pengelolaan keuangan yang sehat dan berkelanjutan.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Macro Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-amber-500" />
                                    Analisis Makroekonomi & Finansial
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg border-b pb-2">📊 Kondisi Makro</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="font-medium text-blue-700 dark:text-blue-300">Stabilitas Pemasukan</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Iuran bulanan warga (50 KK × Rp 10.000 = Rp 500.000/bulan) menjadi backbone pendapatan dengan
                                                    kontribusi <strong>{analysis.incomeBreakdown.find(i => i.kategori === 'Iuran')?.percentage.toFixed(0) || 70}%</strong> dari total pemasukan.
                                                    Tingkat kepatuhan iuran stabil menunjukkan ekonomi mikro warga yang sehat.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <p className="font-medium text-green-700 dark:text-green-300">Surplus Berkelanjutan</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Rata-rata surplus bulanan Rp {Math.round(analysis.netCashFlow / reports.length).toLocaleString('id-ID')}
                                                    memungkinkan pembentukan dana cadangan untuk kebutuhan darurat dan proyek infrastruktur.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                <p className="font-medium text-amber-700 dark:text-amber-300">Inflasi & Biaya Operasional</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Biaya kebersihan dan operasional relatif stabil (±Rp 200.000/bulan untuk honor petugas).
                                                    Perlu antisipasi kenaikan UMR Jakarta yang dapat mempengaruhi biaya tenaga kerja di 2026.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg border-b pb-2">💰 Investment & Financial Planning</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                <p className="font-medium text-purple-700 dark:text-purple-300">Dana Cadangan</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Saldo saat ini {formatCurrency(reports[0]?.saldo_akhir || 0)} setara dengan
                                                    <strong> {Math.round((reports[0]?.saldo_akhir || 0) / analysis.avgMonthlyExpense)} bulan</strong> biaya operasional.
                                                    Ini memenuhi standar <em>Emergency Fund</em> 3-6 bulan yang direkomendasikan.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                                <p className="font-medium text-indigo-700 dark:text-indigo-300">Potensi Investasi Sederhana</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Dana idle dapat dipertimbangkan untuk deposito berjangka 3 bulan di bank BUMN
                                                    (return ±3-4% p.a.) untuk menghasilkan passive income bagi kas RT.
                                                </p>
                                            </div>
                                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                                                <p className="font-medium text-rose-700 dark:text-rose-300">Risiko & Mitigasi</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Risiko utama: tunggakan iuran dan pengeluaran tak terduga (bencana/kerusakan fasilitas).
                                                    Alokasikan 10-15% surplus untuk dana kontingensi.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card className="border-2 border-primary/30">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    Rekomendasi Strategis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold shrink-0">1</div>
                                            <div>
                                                <h5 className="font-semibold">Pertahankan Tingkat Iuran</h5>
                                                <p className="text-sm text-muted-foreground">Nominal Rp 10.000/bulan masih wajar dan terjangkau. Fokus pada peningkatan kepatuhan pembayaran tepat waktu.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                                            <div>
                                                <h5 className="font-semibold">Digitalisasi Pembayaran</h5>
                                                <p className="text-sm text-muted-foreground">Implementasi QR Code / transfer bank untuk memudahkan warga dan meningkatkan transparansi pencatatan.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold shrink-0">3</div>
                                            <div>
                                                <h5 className="font-semibold">Alokasi Dana Event</h5>
                                                <p className="text-sm text-muted-foreground">Kegiatan 17 Agustus menyerap 64% pengeluaran bulan tersebut. Siapkan budget khusus tahunan untuk event.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold shrink-0">4</div>
                                            <div>
                                                <h5 className="font-semibold">Audit Berkala</h5>
                                                <p className="text-sm text-muted-foreground">Lakukan audit internal setiap kuartal dengan melibatkan minimal 2 warga sebagai pengawas independen.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 font-bold shrink-0">5</div>
                                            <div>
                                                <h5 className="font-semibold">Infrastruktur Prioritas</h5>
                                                <p className="text-sm text-muted-foreground">Dengan surplus stabil, pertimbangkan investasi CCTV atau penerangan jalan tambahan untuk keamanan.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 font-bold shrink-0">6</div>
                                            <div>
                                                <h5 className="font-semibold">Laporan Publik</h5>
                                                <p className="text-sm text-muted-foreground">Publikasikan ringkasan keuangan bulanan di grup WhatsApp RT untuk menjaga kepercayaan warga.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conclusion */}
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <Info className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-green-800 dark:text-green-300 mb-2">Kesimpulan Akhir</h4>
                                        <p className="text-green-700 dark:text-green-400 leading-relaxed">
                                            Kondisi keuangan RT 04 RW 09 Kemayoran dinilai <strong>SEHAT</strong> dengan indikator:
                                            savings rate positif ({analysis.savingsRate.toFixed(1)}%), pertumbuhan saldo {analysis.growthRate.toFixed(1)}%,
                                            dan cadangan dana mencukupi {Math.round((reports[0]?.saldo_akhir || 0) / analysis.avgMonthlyExpense)} bulan operasional.
                                            Dengan mempertahankan disiplin anggaran dan transparansi, kas RT dapat terus berkembang
                                            untuk mendukung program-program kesejahteraan warga di masa mendatang.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
