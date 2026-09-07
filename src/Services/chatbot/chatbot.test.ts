// c:\Users\user\Desktop\prisma\src\Services\chatbot\chatbot.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { chatbotOrchestrator } from './orchestrator';
import { SuratAgent } from './agents/surat.agent';
import { KeuanganAgent } from './agents/keuangan.agent';
import { WargaAgent } from './agents/warga.agent';
import { KeamananAgent } from './agents/keamanan.agent';
import { InformasiRTAgent } from './agents/informasi-rt.agent';
import { useChatStore } from '@/stores/chat.store';

describe('Chatbot Agent Architecture & Intent Router', () => {
  beforeEach(() => {
    useChatStore.setState({
      isOpen: false,
      isMinimized: false,
      activeConversation: 'session-default',
      selectedQuickAction: null,
      inputDraft: '',
      unreadCount: 0,
      agentStatus: 'idle',
    });
  });

  describe('SubAgents Intent Detection', () => {
    it('SuratAgent should detect letter/administrative keywords', async () => {
      expect(SuratAgent.canHandle('Bagaimana cara buat surat pengantar domisili?')).toBe(true);
      expect(SuratAgent.canHandle('Saya butuh pengantar SKCK')).toBe(true);
      expect(SuratAgent.canHandle('Berapa saldo kas RT?')).toBe(false);

      const response = await SuratAgent.process('Mau buat surat pengantar domisili');
      expect(response.intent).toBe('surat');
      expect(response.reply).toContain('Surat Keterangan Domisili');
    });

    it('KeuanganAgent should detect dues and financial keywords', async () => {
      expect(KeuanganAgent.canHandle('Cek iuran bulanan saya')).toBe(true);
      expect(KeuanganAgent.canHandle('Laporan kas RT bulan ini')).toBe(true);
      expect(KeuanganAgent.canHandle('Jadwal ronda malam')).toBe(false);

      const response = await KeuanganAgent.process('Cek iuran bulanan');
      expect(response.intent).toBe('keuangan');
      expect(response.reply).toContain('Keuangan');
      expect(response.reply).toContain('iuran bulanan');
    });

    it('WargaAgent should detect resident registry keywords', async () => {
      expect(WargaAgent.canHandle('Bagaimana cara daftar warga baru?')).toBe(true);
      expect(WargaAgent.canHandle('Saya baru pindah ke RT 04')).toBe(true);

      const response = await WargaAgent.process('Pendataan warga baru');
      expect(response.intent).toBe('warga');
      expect(response.reply).toContain('Warga Baru');
    });

    it('KeamananAgent should detect patrol and security keywords', async () => {
      expect(KeamananAgent.canHandle('Kapan jadwal ronda malam ini?')).toBe(true);
      expect(KeamananAgent.canHandle('Kerja bakti hari apa?')).toBe(true);

      const response = await KeamananAgent.process('Jadwal ronda');
      expect(response.intent).toBe('keamanan');
      expect(response.reply).toContain('Siskamling');
    });

    it('InformasiRTAgent should detect officials and contact keywords', async () => {
      expect(InformasiRTAgent.canHandle('Berapa nomor WA Pak RT?')).toBe(true);
      expect(InformasiRTAgent.canHandle('Kontak pengurus RT 04')).toBe(true);

      const response = await InformasiRTAgent.process('Kontak Pak RT');
      expect(response.intent).toBe('informasi_rt');
      expect(response.reply).toContain('0878-7200-4448');
    });
  });

  describe('Chatbot Orchestrator Intent Routing', () => {
    it('should accurately route various citizen inquiries to correct subagents', () => {
      expect(chatbotOrchestrator.routeIntent('bikin surat pengantar nikah')).toBe('surat');
      expect(chatbotOrchestrator.routeIntent('bayar iuran kebersihan')).toBe('keuangan');
      expect(chatbotOrchestrator.routeIntent('daftar warga baru')).toBe('warga');
      expect(chatbotOrchestrator.routeIntent('jadwal siskamling')).toBe('keamanan');
      expect(chatbotOrchestrator.routeIntent('alamat pos RT 04')).toBe('informasi_rt');
      expect(chatbotOrchestrator.routeIntent('selamat pagi apa kabar')).toBe('general');
    });

    it('should dispatch to appropriate agent and return structured response', async () => {
      const res = await chatbotOrchestrator.dispatchToAgent('nomor whatsapp pak rt');
      expect(res.intent).toBe('informasi_rt');
      expect(res.reply).toContain('Bpk. R Erry Adu Sundaru');
      expect(typeof res.responseTimeMs).toBe('number');
    });
  });

  describe('Zustand Chat Store (Client UI Only)', () => {
    it('should manage modal open/close and reset unread count on open', () => {
      const store = useChatStore.getState();
      expect(store.isOpen).toBe(false);
      expect(store.unreadCount).toBe(0);

      useChatStore.getState().incrementUnreadCount();
      useChatStore.getState().incrementUnreadCount();
      expect(useChatStore.getState().unreadCount).toBe(2);

      useChatStore.getState().setIsOpen(true);
      expect(useChatStore.getState().isOpen).toBe(true);
      expect(useChatStore.getState().unreadCount).toBe(0);

      useChatStore.getState().toggleOpen();
      expect(useChatStore.getState().isOpen).toBe(false);
    });

    it('should manage draft input and quick actions without storing messages in Zustand', () => {
      useChatStore.getState().setInputDraft('Halo mau tanya');
      useChatStore.getState().setSelectedQuickAction('surat');
      expect(useChatStore.getState().inputDraft).toBe('Halo mau tanya');
      expect(useChatStore.getState().selectedQuickAction).toBe('surat');

      useChatStore.getState().resetDraft();
      expect(useChatStore.getState().inputDraft).toBe('');
      expect(useChatStore.getState().selectedQuickAction).toBeNull();
    });

    it('should track agentStatus transitions', () => {
      useChatStore.getState().setAgentStatus('routing');
      expect(useChatStore.getState().agentStatus).toBe('routing');

      useChatStore.getState().setAgentStatus('thinking');
      expect(useChatStore.getState().agentStatus).toBe('thinking');

      useChatStore.getState().setAgentStatus('idle');
      expect(useChatStore.getState().agentStatus).toBe('idle');
    });
  });
});
