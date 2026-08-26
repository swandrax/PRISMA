/**
 * PRISMA RT 04 — Warga Knowledge Graph & RAG Engine
 * Represents citizen relationships (Warga, KK, Blok, Pengurus, Layanan)
 * Powers Registration, Authentication, and Intelligent Citizen Querying.
 */

import { INITIAL_50_WARGA, WargaSeedItem } from "./seed-data";

export interface WargaGraphNode {
  id: string;
  nik: string;
  noKK: string;
  nama: string;
  email: string;
  telepon: string;
  role: "WARGA" | "PENGURUS" | "ADMIN";
  jabatanPengurus?: string;
  alamat: string;
  blok: string;
  noRumah: string;
  statusKeluarga: string;
  pekerjaan: string;
  status: "AKTIF" | "PINDAH" | "MENINGGAL";
  passwordHash?: string;
  connectedNodes: {
    kkMembers: string[]; // IDs of family members in same KK
    tetanggaBlok: string[]; // IDs of neighbors in same Blok
    pengurusKontak?: string; // ID of assigned RT leader
  };
}

export interface WargaGraph {
  nodes: Map<string, WargaGraphNode>;
  blokIndex: Map<string, string[]>;
  kkIndex: Map<string, string[]>;
  emailIndex: Map<string, string>;
  nikIndex: Map<string, string>;
  phoneIndex: Map<string, string>;
}

// In-Memory Global Knowledge Graph Instance
class WargaKnowledgeGraphEngine {
  private graph: WargaGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      blokIndex: new Map(),
      kkIndex: new Map(),
      emailIndex: new Map(),
      nikIndex: new Map(),
      phoneIndex: new Map(),
    };
    this.initializeFromSeed();
  }

  private initializeFromSeed() {
    INITIAL_50_WARGA.forEach((w) => {
      this.addNode({
        ...w,
        passwordHash: "prisma123", // Default demo password
        connectedNodes: {
          kkMembers: [],
          tetanggaBlok: [],
        },
      });
    });
    this.rebuildRelations();
  }

  private rebuildRelations() {
    this.graph.nodes.forEach((node) => {
      // Connect KK members
      const sameKK = (this.graph.kkIndex.get(node.noKK) || []).filter((id) => id !== node.id);
      node.connectedNodes.kkMembers = sameKK;

      // Connect Blok neighbors
      const sameBlok = (this.graph.blokIndex.get(node.blok) || []).filter((id) => id !== node.id);
      node.connectedNodes.tetanggaBlok = sameBlok.slice(0, 5);
    });
  }

  // --- CRUD: CREATE ---
  public addNode(item: WargaSeedItem & { passwordHash?: string; connectedNodes?: WargaGraphNode["connectedNodes"] }): WargaGraphNode {
    const node: WargaGraphNode = {
      id: item.id,
      nik: item.nik,
      noKK: item.noKK,
      nama: item.nama,
      email: item.email.toLowerCase(),
      telepon: item.telepon,
      role: item.role || "WARGA",
      jabatanPengurus: item.jabatanPengurus,
      alamat: item.alamat || "Jl. Bugis RT 04 RW 06",
      blok: item.blok.toUpperCase(),
      noRumah: item.noRumah,
      statusKeluarga: item.statusKeluarga || "Kepala Keluarga",
      pekerjaan: item.pekerjaan || "Wiraswasta",
      status: item.status || "AKTIF",
      passwordHash: item.passwordHash || "prisma123",
      connectedNodes: item.connectedNodes || { kkMembers: [], tetanggaBlok: [] },
    };

    this.graph.nodes.set(node.id, node);

    // Update Indices
    this.graph.emailIndex.set(node.email, node.id);
    this.graph.nikIndex.set(node.nik, node.id);
    this.graph.phoneIndex.set(node.telepon, node.id);

    // Blok index
    const blokList = this.graph.blokIndex.get(node.blok) || [];
    blokList.push(node.id);
    this.graph.blokIndex.set(node.blok, blokList);

    // KK index
    const kkList = this.graph.kkIndex.get(node.noKK) || [];
    kkList.push(node.id);
    this.graph.kkIndex.set(node.noKK, kkList);

    return node;
  }

  // --- CRUD: READ ---
  public getNodeById(id: string): WargaGraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  public findByCredentials(identifier: string): WargaGraphNode | undefined {
    const clean = identifier.trim().toLowerCase();
    const idByEmail = this.graph.emailIndex.get(clean);
    if (idByEmail) return this.graph.nodes.get(idByEmail);

    const idByNik = this.graph.nikIndex.get(clean);
    if (idByNik) return this.graph.nodes.get(idByNik);

    const idByPhone = this.graph.phoneIndex.get(clean);
    if (idByPhone) return this.graph.nodes.get(idByPhone);

    // Fallback: search by name
    for (const node of this.graph.nodes.values()) {
      if (node.nama.toLowerCase().includes(clean)) {
        return node;
      }
    }
    return undefined;
  }

  public getAllNodes(): WargaGraphNode[] {
    return Array.from(this.graph.nodes.values());
  }

  // --- CRUD: UPDATE ---
  public updateNode(id: string, updates: Partial<WargaGraphNode>): WargaGraphNode | null {
    const existing = this.graph.nodes.get(id);
    if (!existing) return null;

    const updated: WargaGraphNode = {
      ...existing,
      ...updates,
      id, // protect ID
    };

    this.graph.nodes.set(id, updated);
    return updated;
  }

  // --- CRUD: DELETE ---
  public deleteNode(id: string): boolean {
    const existing = this.graph.nodes.get(id);
    if (!existing) return false;

    this.graph.nodes.delete(id);
    this.graph.emailIndex.delete(existing.email);
    this.graph.nikIndex.delete(existing.nik);
    this.graph.phoneIndex.delete(existing.telepon);

    return true;
  }

  // --- RAG SEARCH OVER GRAPH ---
  public queryRAG(query: string, limit: number = 10): WargaGraphNode[] {
    const q = query.toLowerCase();
    const results: { node: WargaGraphNode; score: number }[] = [];

    this.graph.nodes.forEach((node) => {
      let score = 0;
      if (node.nama.toLowerCase().includes(q)) score += 10;
      if (node.nik.includes(q)) score += 15;
      if (node.blok.toLowerCase() === q || `blok ${node.blok.toLowerCase()}`.includes(q)) score += 8;
      if (node.jabatanPengurus && node.jabatanPengurus.toLowerCase().includes(q)) score += 12;
      if (node.pekerjaan.toLowerCase().includes(q)) score += 5;
      if (node.alamat.toLowerCase().includes(q)) score += 6;

      if (score > 0) {
        results.push({ node, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => r.node);
  }
}

// Global Singleton for Graph Knowledge
const globalForGraph = globalThis as unknown as { wargaKnowledgeGraph: WargaKnowledgeGraphEngine };

export const wargaGraphEngine = globalForGraph.wargaKnowledgeGraph || new WargaKnowledgeGraphEngine();

if (process.env.NODE_ENV !== "production") {
  globalForGraph.wargaKnowledgeGraph = wargaGraphEngine;
}
