import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface QueuedMutation {
  id: string; // clientMutationId
  entity: string; // 'LAPORAN_KEAMANAN' | 'SURAT' | 'ASPIRASI' | 'IURAN_PAYMENT'
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

interface PrismaOfflineDB extends DBSchema {
  mutations: {
    key: string;
    value: QueuedMutation;
    indexes: { 'by-created': number };
  };
}

const DB_NAME = 'prisma-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PrismaOfflineDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<PrismaOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('mutations')) {
          const store = db.createObjectStore('mutations', { keyPath: 'id' });
          store.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueMutation(mutation: Omit<QueuedMutation, 'createdAt' | 'retryCount'>): Promise<QueuedMutation> {
  const db = await getDB();
  const fullMutation: QueuedMutation = {
    ...mutation,
    createdAt: Date.now(),
    retryCount: 0,
  };
  if (db) {
    await db.put('mutations', fullMutation);
  }
  return fullMutation;
}

export async function getAllQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await getDB();
  if (!db) return [];
  return await db.getAllFromIndex('mutations', 'by-created');
}

export async function removeQueuedMutation(id: string): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.delete('mutations', id);
  }
}

export async function updateQueuedMutation(mutation: QueuedMutation): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.put('mutations', mutation);
  }
}

export async function clearQueuedMutations(): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.clear('mutations');
  }
}
