// c:\Users\user\Desktop\prisma\src\lib\telegram\bot.ts

export class TelegramBot {
    private token: string;
    private baseUrl: string;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            console.warn("TELEGRAM_BOT_TOKEN is not defined in environment variables");
        }
        this.token = token || '';
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    }

    async sendMessage(chatId: string | number, text: string) {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                }),
            });
            
            if (!response.ok) {
                console.error(`Telegram send message failed: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error sending Telegram message:", error);
        }
    }

    async sendMessageWithKeyboard(chatId: string | number, text: string, inlineKeyboard: any[][]) {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: inlineKeyboard
                    }
                }),
            });
            
            if (!response.ok) {
                console.error(`Telegram send message with keyboard failed: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error sending Telegram message with keyboard:", error);
        }
    }
}

export const bot = new TelegramBot();
