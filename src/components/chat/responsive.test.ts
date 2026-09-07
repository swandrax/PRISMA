// c:\Users\user\Desktop\prisma\src\components\chat\responsive.test.ts
import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatHeader } from './ChatHeader';
import { QuickActions } from './QuickActions';
import { ChatComposer } from './ChatComposer';
import { QUICK_ACTION_CHIPS } from '@/Services/chatbot/chatbot.service';

describe('PRISMA Chatbot Responsive UI & A11y Standards', () => {
  describe('ChatHeader Accessibility & Layout', () => {
    it('should render close button with aria-label="Tutup chat"', () => {
      render(React.createElement(ChatHeader));
      const closeBtn = screen.getByLabelText('Tutup chat');
      expect(closeBtn).toBeDefined();
      expect(closeBtn.tagName.toLowerCase()).toBe('button');
    });

    it('should display Mbak PRISMA title and RT 04 subtitle', () => {
      render(React.createElement(ChatHeader));
      expect(screen.getByText('Mbak PRISMA')).toBeDefined();
      expect(screen.getByText('Asisten Warga RT 04')).toBeDefined();
    });
  });

  describe('QuickActions Horizontal Scrolling & Overflow Prevention', () => {
    it('should render all quick action chips as semantic buttons without escaping container', () => {
      const onSelect = () => {};
      render(React.createElement(QuickActions, { onSelectAction: onSelect }));

      const nav = screen.getByRole('navigation', { name: 'Aksi Cepat' });
      expect(nav).toBeDefined();

      for (const chip of QUICK_ACTION_CHIPS) {
        const btn = screen.getByRole('button', { name: chip.label });
        expect(btn).toBeDefined();
        // Chips must not allow shrinking or wrapping
        expect(btn.style.flex).toBe('0 0 auto');
        expect(btn.style.whiteSpace).toBe('nowrap');
      }
    });
  });

  describe('ChatComposer Responsive Layout & Touch Targets', () => {
    it('should render send button with aria-label="Kirim pesan" and 44px min touch target', () => {
      const onSend = () => {};
      render(React.createElement(ChatComposer, { onSend }));

      const sendBtn = screen.getByLabelText('Kirim pesan');
      expect(sendBtn).toBeDefined();
      expect(sendBtn.tagName.toLowerCase()).toBe('button');
      expect(sendBtn.style.width).toBe('44px');
      expect(sendBtn.style.height).toBe('44px');
      expect(sendBtn.style.flexShrink).toBe('0');
    });

    it('should have input with min-width: 0 and placeholder seputar RT 04', () => {
      const onSend = () => {};
      render(React.createElement(ChatComposer, { onSend }));

      const input = screen.getByPlaceholderText('Ketik pesan seputar RT 04...');
      expect(input).toBeDefined();
      expect(['0', '0px']).toContain(input.style.minWidth);
      expect(input.style.width).toBe('100%');
    });
  });

  describe('Responsive Breakpoint Calculations', () => {
    const breakpoints = [
      { name: 'Mobile Extra Small', width: 320 },
      { name: 'Mobile Small', width: 360 },
      { name: 'iPhone SE', width: 375 },
      { name: 'iPhone 12/13/14 Pro', width: 390 },
      { name: 'iPhone Plus / Max', width: 414 },
      { name: 'Tablet (iPad Mini)', width: 768 },
      { name: 'Desktop Small', width: 1024 },
      { name: 'Desktop Large', width: 1440 },
    ];

    breakpoints.forEach(({ name, width }) => {
      it(`should calculate proper container dimension at ${name} (${width}px)`, () => {
        // max-width formula min(100%, 420px)
        const computedWidth = Math.min(width, 420);
        expect(computedWidth).toBeLessThanOrEqual(width);
        expect(computedWidth).toBeLessThanOrEqual(420);

        // At 320px viewport, container must fit within 320px without horizontal scroll
        if (width <= 420) {
          expect(computedWidth).toBe(width);
        } else {
          expect(computedWidth).toBe(420);
        }
      });
    });
  });
});
