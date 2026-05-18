"use client";

import { useState, useEffect, useCallback } from "react";
import { SqliteDB } from "@/lib/sqliteDB";

export default function DatabaseSettingsPage() {
    const [status, setStatus] = useState("Checking...");
    const [wargaCount, setWargaCount] = useState(0);

    const refreshStats = useCallback(async () => {
        try {
            await SqliteDB.init();
            const warga = SqliteDB.getAllWarga();
            setWargaCount(warga.length);
            setStatus("Ready");
        } catch {
            setStatus("Error connecting to DB");
        }
    }, []);

    useEffect(() => {
        setTimeout(refreshStats, 0);
    }, [refreshStats]);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const success = await SqliteDB.importDB(file);
        if (success) {
            alert("Database imported successfully!");
            refreshStats();
        } else {
            alert("Failed to import database.");
        }
    };

    const handleExport = () => {
        const u8 = SqliteDB.exportDB();
        if (!u8) return;
        // Cast to BlobPart to avoid SharedArrayBuffer/ArrayBuffer TS mismatch
        const blob = new Blob([u8 as BlobPart], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prisma_backup_${new Date().toISOString().slice(0, 10)}.sqlite`;
        a.click();
    };

    const handleGenerate = () => {
        if (confirm("Are you sure? This will add 50 dummy records.")) {
            SqliteDB.generateDummyData(50);
            refreshStats();
            alert("50 records generated!");
        }
    };

    const handleReset = () => {
        if (confirm("WARNING: This will delete all data. Are you sure?")) {
            SqliteDB.resetDB();
            refreshStats();
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Database Settings (SQLite)</h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Status</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-lg font-bold text-green-600">{status}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded">
                        <p className="text-sm text-gray-500">Total Warga</p>
                        <p className="text-lg font-bold">{wargaCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Import / Export */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Import / Export</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Import .sqlite file</label>
                            <input
                                type="file"
                                accept=".sqlite,.db"
                                onChange={handleImport}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                        >
                            Export Database
                        </button>
                    </div>
                </div>

                {/* Data Generation */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
                    <h2 className="text-xl font-semibold mb-4">Developer Tools</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerate}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1"
                        >
                            Generate 50 Dummy Records
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
                        >
                            Reset Database
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
