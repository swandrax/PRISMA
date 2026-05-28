// c:\Users\user\Desktop\prisma\scripts\setup-telegram-webhook.ts
import 'dotenv/config';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function setupWebhook() {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'your-telegram-bot-token') {
        console.error("Error: TELEGRAM_BOT_TOKEN is not set or invalid.");
        process.exit(1);
    }

    if (!NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_SITE_URL === 'http://localhost:3000') {
        console.warn("Warning: NEXT_PUBLIC_SITE_URL is not set to a public URL. Webhooks require a public HTTPS URL.");
    }

    const webhookUrl = `${NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`;
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;

    console.log(`Setting webhook to: ${webhookUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: TELEGRAM_WEBHOOK_SECRET,
                allowed_updates: ['message'],
                drop_pending_updates: true
            }),
        });

        const data = await response.json();
        
        if (data.ok) {
            console.log("✅ Webhook successfully set!");
            console.log(data.description);
        } else {
            console.error("❌ Failed to set webhook:", data.description);
        }
    } catch (error) {
        console.error("❌ Error setting webhook:", error);
    }
}

setupWebhook();
