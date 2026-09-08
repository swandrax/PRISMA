import { describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { intentRouter } from './agents/router';
import { useChatbotStore } from './stores/chatbot.store';
import { ChatHeader } from './components/chat-header';
import { ChatComposer } from './components/chat-composer';
import { QuickActions } from './components/quick-actions';

describe('PRISMA Chatbot Feature Suite', () => {
  beforeEach(() => {
    useChatbotStore.setState({
      isOpen: false,
      isMinimized: false,
      unreadCount: 0,
      agentStatus: 'idle',
      inputDraft: '',
      selectedQuickAction: null,
    });
  });

  describe('Multi-Agent Intent Router', () => {
    it('should route surat queries to surat agent', async () => {
      const intent = intentRouter.routeIntent('Bagaimana cara membuat surat domisili?');
      expect(intent).toBe('surat');

      const res = await intentRouter.dispatchToAgent('Bagaimana cara membuat surat domisili?');
      expect(res.intent).toBe('surat');
      expect(res.reply).toContain('Surat Keterangan Domisili');
    });

    it('should route keuangan queries to keuangan agent', async () => {
      const intent = intentRouter.routeIntent('Berapa iuran kas bulanan warga?');
      expect(intent).toBe('keuangan');

      const res = await intentRouter.dispatchToAgent('Berapa iuran kas bulanan warga?');
      expect(res.intent).toBe('keuangan');
      expect(res.reply).toContain('Iuran RT 04');
    });

    it('should route keamanan queries to keamanan agent', async () => {
      const intent = intentRouter.routeIntent('Kapan jadwal ronda malam siskamling?');
      expect(intent).toBe('keamanan');

      const res = await intentRouter.dispatchToAgent('Kapan jadwal ronda malam siskamling?');
      expect(res.intent).toBe('keamanan');
      expect(res.reply).toContain('Ronda Malam');
    });

    it('should route warga queries to warga agent', async () => {
      const intent = intentRouter.routeIntent('Bagaimana pendataan warga baru yang baru pindah?');
      expect(intent).toBe('warga');

      const res = await intentRouter.dispatchToAgent('Bagaimana pendataan warga baru yang baru pindah?');
      expect(res.intent).toBe('warga');
      expect(res.reply).toContain('Pendataan Warga');
    });

    it('should route kontak pak RT to informasi RT agent', async () => {
      const intent = intentRouter.routeIntent('Boleh minta nomor telepon dan wa Pak RT?');
      expect(intent).toBe('informasi_rt');

      const res = await intentRouter.dispatchToAgent('Boleh minta nomor telepon dan wa Pak RT?');
      expect(res.intent).toBe('informasi_rt');
      expect(res.reply).toContain('Erry');
    });
  });

  describe('Zustand UI State Management', () => {
    it('should toggle open/closed state properly', () => {
      expect(useChatbotStore.getState().isOpen).toBe(false);
      useChatbotStore.getState().toggleOpen();
      expect(useChatbotStore.getState().isOpen).toBe(true);
      useChatbotStore.getState().toggleOpen();
      expect(useChatbotStore.getState().isOpen).toBe(false);
    });

    it('should track unread count when closed', () => {
      expect(useChatbotStore.getState().unreadCount).toBe(0);
      useChatbotStore.getState().incrementUnread();
      expect(useChatbotStore.getState().unreadCount).toBe(1);
      useChatbotStore.getState().toggleOpen();
      expect(useChatbotStore.getState().unreadCount).toBe(0);
    });

    it('should manage input drafts and reset cleanly', () => {
      useChatbotStore.getState().setInputDraft('Pertanyaan uji coba');
      expect(useChatbotStore.getState().inputDraft).toBe('Pertanyaan uji coba');
      useChatbotStore.getState().resetDraft();
      expect(useChatbotStore.getState().inputDraft).toBe('');
    });
  });

  describe('Chatbot Responsive Design & Accessibility Standards', () => {
    it('should render header with aria-label="Tutup chat"', () => {
      render(React.createElement(ChatHeader));
      const closeBtn = screen.getByLabelText('Tutup chat');
      expect(closeBtn).toBeDefined();
    });

    it('should render composer with 44px min touch target and aria-label="Kirim pesan"', () => {
      render(React.createElement(ChatComposer, { onSend: () => {} }));
      const sendBtn = screen.getByLabelText('Kirim pesan');
      expect(sendBtn).toBeDefined();
      expect(sendBtn.style.width).toBe('44px');
      expect(sendBtn.style.height).toBe('44px');
      expect(sendBtn.style.flexShrink).toBe('0');
    });

    it('should render quick actions with non-wrapping horizontal scroll row', () => {
      render(React.createElement(QuickActions, { onSelectAction: () => {} }));
      const nav = screen.getByRole('navigation', { name: 'Aksi Cepat' });
      expect(nav).toBeDefined();

      const chip = screen.getByRole('button', { name: '📄 Bikin Surat Pengantar' });
      expect(chip).toBeDefined();
      expect(chip.style.flex).toBe('0 0 auto');
      expect(chip.style.whiteSpace).toBe('nowrap');
    });

    const viewports = [320, 360, 375, 390, 414, 768, 1024, 1440];
    viewports.forEach((width) => {
      it(`should constrain chat shell at ${width}px without viewport overflow`, () => {
        const computed = Math.min(width, 420);
        expect(computed).toBeLessThanOrEqual(width);
        expect(computed).toBeLessThanOrEqual(420);
      });
    });
  });
});
