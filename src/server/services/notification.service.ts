import prisma from '../db/prisma';

export interface SendNotificationParams {
  userId?: string;
  wargaId?: string;
  type: 'SURAT' | 'IURAN' | 'KEAMANAN' | 'PENGUMUMAN' | 'SISTEM';
  title: string;
  message: string;
  link?: string;
  sendTelegram?: boolean;
}

/**
 * Dispatch an in-app notification and optionally broadcast via Telegram bot
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  try {
    // 1. Create database notification record
    await prisma.notification.create({
      data: {
        userId: params.userId,
        wargaId: params.wargaId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });

    // 2. Telegram webhook or bot forward if enabled
    if (params.sendTelegram && process.env.TELEGRAM_BOT_TOKEN && process.env.ADMIN_CHAT_ID) {
      const tgText = `🔔 *${params.title}*\n${params.message}${params.link ? `\n\n🔗 [Buka PRISMA](${params.link})` : ''}`;
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_CHAT_ID,
          text: tgText,
          parse_mode: 'Markdown',
        }),
      }).catch((e) => console.error('[Telegram notification error]', e));
    }
  } catch (error) {
    console.error('[Notification Dispatch Error]', error);
  }
}
