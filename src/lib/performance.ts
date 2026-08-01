// Web Vitals & Performance Monitoring

interface WebVitalMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
}

const vitalsLog: WebVitalMetric[] = [];
const MAX_VITALS = 50;

export function reportWebVital(metric: { name: string; value: number }) {
    const rating = getVitalRating(metric.name, metric.value);

    const entry: WebVitalMetric = {
        name: metric.name,
        value: metric.value,
        rating,
        timestamp: Date.now(),
    };

    vitalsLog.unshift(entry);
    if (vitalsLog.length > MAX_VITALS) vitalsLog.pop();

    if (rating === 'poor' && process.env.NODE_ENV === 'production') {
        console.warn(`[Performance] Poor ${metric.name}: ${metric.value}`);
    }
}

function getVitalRating(name: string, value: number): WebVitalMetric['rating'] {
    const thresholds: Record<string, [number, number]> = {
        LCP: [2500, 4000],
        FID: [100, 300],
        CLS: [0.1, 0.25],
        TTFB: [800, 1800],
        INP: [200, 500],
        FCP: [1800, 3000],
    };

    const [good, poor] = thresholds[name] || [1000, 3000];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
}

export function getVitalsReport(): WebVitalMetric[] {
    return [...vitalsLog];
}

// API Response Timing

interface ApiTimingEntry {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
}

const apiTimings: ApiTimingEntry[] = [];
const MAX_TIMINGS = 100;

export function trackApiCall(url: string, method: string, duration: number, status: number) {
    apiTimings.unshift({ url, method, duration, status, timestamp: Date.now() });
    if (apiTimings.length > MAX_TIMINGS) apiTimings.pop();
}

export function getApiTimingStats() {
    if (apiTimings.length === 0) return { avgDuration: 0, p95Duration: 0, errorRate: 0 };

    const durations = apiTimings.map(t => t.duration).sort((a, b) => a - b);
    const errors = apiTimings.filter(t => t.status >= 400).length;

    return {
        totalCalls: apiTimings.length,
        avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        p95Duration: Math.round(durations[Math.floor(durations.length * 0.95)] || 0),
        errorRate: `${((errors / apiTimings.length) * 100).toFixed(1)}%`,
        slowestEndpoints: getTopSlowest(5),
    };
}

function getTopSlowest(n: number): Array<{ url: string; avgDuration: number }> {
    const byUrl = new Map<string, number[]>();

    for (const t of apiTimings) {
        const key = `${t.method} ${t.url}`;
        if (!byUrl.has(key)) byUrl.set(key, []);
        byUrl.get(key)!.push(t.duration);
    }

    return Array.from(byUrl.entries())
        .map(([url, durations]) => ({
            url,
            avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        }))
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, n);
}

// Resource Loading

export function measureResourceLoading(): { scripts: number; stylesheets: number; images: number; totalSize: string } | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = entries.filter(e => e.initiatorType === 'script').length;
    const stylesheets = entries.filter(e => e.initiatorType === 'css' || e.initiatorType === 'link').length;
    const images = entries.filter(e => e.initiatorType === 'img').length;
    const totalBytes = entries.reduce((sum, e) => sum + (e.transferSize || 0), 0);

    return { scripts, stylesheets, images, totalSize: `${(totalBytes / 1024).toFixed(1)} KB` };
}

// Fetch wrapper with timing

export async function performanceFetch(url: string, options?: RequestInit): Promise<Response> {
    const start = performance.now();
    const method = options?.method || 'GET';

    try {
        const response = await fetch(url, options);
        const duration = performance.now() - start;
        trackApiCall(url, method, Math.round(duration), response.status);
        return response;
    } catch (error) {
        const duration = performance.now() - start;
        trackApiCall(url, method, Math.round(duration), 0);
        throw error;
    }
}

// Init

export function initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                reportWebVital({
                    name: entry.entryType === 'largest-contentful-paint' ? 'LCP'
                        : entry.entryType === 'first-input' ? 'FID'
                        : entry.name || entry.entryType,
                    value: entry.startTime || 0,
                });
            }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'first-input', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
        // PerformanceObserver not supported
    }
}

// Cache & DataLoader Telemetry Monitoring
interface CacheTelemetry {
    hits: number;
    misses: number;
    totalBatchRequests: number;
    itemsProcessedInBatches: number;
    queriesSaved: number;
}

const cacheTelemetry: CacheTelemetry = {
    hits: 0,
    misses: 0,
    totalBatchRequests: 0,
    itemsProcessedInBatches: 0,
    queriesSaved: 0,
};

export function trackCacheAccess(hit: boolean) {
    if (hit) cacheTelemetry.hits++;
    else cacheTelemetry.misses++;
}

export function trackBatchExecution(itemsInBatch: number) {
    cacheTelemetry.totalBatchRequests++;
    cacheTelemetry.itemsProcessedInBatches += itemsInBatch;
    if (itemsInBatch > 1) {
        // N items retrieved in 1 query = N - 1 sequential queries eliminated (N+1 optimization)
        cacheTelemetry.queriesSaved += (itemsInBatch - 1);
    }
}

export function getCacheTelemetryReport() {
    const total = cacheTelemetry.hits + cacheTelemetry.misses;
    const hitRate = total > 0 ? ((cacheTelemetry.hits / total) * 100).toFixed(1) + '%' : '0.0%';
    return {
        totalAccesses: total,
        hitRate,
        queriesSaved: cacheTelemetry.queriesSaved,
        avgBatchSize: cacheTelemetry.totalBatchRequests > 0 
            ? Math.round(cacheTelemetry.itemsProcessedInBatches / cacheTelemetry.totalBatchRequests)
            : 0
    };
}

