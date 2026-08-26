import { databaseService } from './databaseService';

export interface AnalyticsData {
    period: string;
    financial: {
        currentBalance: number;
        totalIncome: number;
        totalExpense: number;
        netCashflow: number;
        monthlyTrend: Array<{ name: string; income: number; expense: number; balance: number }>;
        expenseCategories: Array<{ name: string; value: number }>;
    };
    administrative: {
        totalRequests: number;
        completedRequests: number;
        pendingRequests: number;
        requestsByType: Array<{ name: string; value: number }>;
    };
    security: {
        totalReports: number;
        resolvedReports: number;
        pendingReports: number;
        reportsByCategory: Array<{ name: string; value: number }>;
    };
    community: {
        isAvailable: boolean;
        totalActivities: number;
        activities: unknown[];
    };
    insights: Array<{
        type: 'summary' | 'warning' | 'opportunity' | 'recommendation' | 'anomaly';
        message: string;
    }>;
}

export const analyticsService = {
    async getAnalyticsOverview(periodStr: string = 'Current'): Promise<AnalyticsData> {
        // Fetch raw data
        const financeSummary = await databaseService.getExpenseSummary();
        const financeReports = await databaseService.getMonthlyReports();
        const securityStats = await databaseService.getSecurityStats();
        
        // --- FINANCIAL AGGREGATION ---
        // Assume first report is current month for mock
        const currentReport = financeReports[0] || { total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 };
        const previousReport = financeReports[1] || { total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 };
        
        const netCashflow = currentReport.total_pemasukan - currentReport.total_pengeluaran;
        
        // Reverse for chronological chart plotting
        const monthlyTrend = [...financeReports].reverse().map(report => ({
            name: report.bulan.substring(0, 3) + ' ' + report.tahun,
            income: report.total_pemasukan,
            expense: report.total_pengeluaran,
            balance: report.saldo_akhir
        }));

        const expenseCategories = financeSummary.categories.map(c => ({
            name: c.kategori,
            value: 'jumlah' in c ? (c as any).jumlah : c.avgBulanan
        }));

        // --- ADMINISTRATIVE AGGREGATION (Mock for now since we don't have request tracking) ---
        // We will generate deterministic mock data based on templates available
        const templates = await databaseService.getLetterTemplates();
        const requestsByType = templates.map((t, index) => ({
            name: t.title,
            value: (index * 5) + 3 // Deterministic mock placeholder
        }));
        const totalRequests = requestsByType.reduce((sum, item) => sum + item.value, 0);
        
        // --- SECURITY AGGREGATION ---
        const reportsByCategory = Object.entries(securityStats.byPriority).map(([key, value]) => ({
            name: key + ' Priority',
            value: value as number
        })).filter(item => item.value > 0);

        // --- AI INSIGHTS ENGINE (Rule-based) ---
        const insights: AnalyticsData['insights'] = [];
        
        // 1. Financial Trend
        if (currentReport.total_pengeluaran > currentReport.total_pemasukan) {
            insights.push({
                type: 'warning',
                message: `Peringatan: Pengeluaran bulan ini (Rp ${currentReport.total_pengeluaran.toLocaleString('id-ID')}) melebihi pemasukan. Terdapat defisit kas.`
            });
        } else {
            insights.push({
                type: 'summary',
                message: `Kas sehat. Terdapat surplus sebesar Rp ${netCashflow.toLocaleString('id-ID')} pada bulan berjalan.`
            });
        }
        
        if (previousReport.total_pengeluaran > 0 && currentReport.total_pengeluaran > previousReport.total_pengeluaran * 1.2) {
            insights.push({
                type: 'anomaly',
                message: `Anomali: Terdapat lonjakan pengeluaran >20% dibanding bulan lalu.`
            });
        }

        // 2. Security
        if (securityStats.pending > 0) {
            insights.push({
                type: 'recommendation',
                message: `Terdapat ${securityStats.pending} laporan keamanan yang belum terselesaikan. Segera tindak lanjuti untuk menjaga kenyamanan warga.`
            });
        } else {
            insights.push({
                type: 'summary',
                message: `Seluruh laporan keamanan telah ditangani dengan baik (100% resolution rate).`
            });
        }

        return {
            period: periodStr,
            financial: {
                currentBalance: currentReport.saldo_akhir,
                totalIncome: currentReport.total_pemasukan,
                totalExpense: currentReport.total_pengeluaran,
                netCashflow: netCashflow,
                monthlyTrend,
                expenseCategories
            },
            administrative: {
                totalRequests,
                completedRequests: Math.floor(totalRequests * 0.8),
                pendingRequests: totalRequests - Math.floor(totalRequests * 0.8),
                requestsByType
            },
            security: {
                totalReports: securityStats.total,
                resolvedReports: securityStats.resolved,
                pendingReports: securityStats.pending,
                reportsByCategory
            },
            community: {
                isAvailable: false,
                totalActivities: 0,
                activities: []
            },
            insights
        };
    }
};
