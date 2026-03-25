import { Telegraf } from 'telegraf';
import axios from 'axios';

const API_BASE = 'http://adminpanel-back:8080/api/BotFeedback';

export async function monitorNewFeedbacks(bot: Telegraf) {
    console.log('✅ API Monitoring started');

    setInterval(async () => {
        try {
            const response = await axios.get(`${API_BASE}/unnotified-feedbacks`);
            const feedbacks = response.data;

            if (!feedbacks || feedbacks.length === 0) return;

            for (const fb of feedbacks) {
                // Преобразуем дату из строки в объект Date и форматируем
                const feedbackTime = fb.date ? new Date(fb.date).toLocaleString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short'
                }) : 'Just now';

                // Формируем сообщение на английском
                const msg = `🆕 *New Feedback #${fb.id}*\n` +
                    `📅 Time: \`${feedbackTime}\`\n` +
                    `📱 Phone: \`${fb.phone || 'N/A'}\`\n` +
                    `👤 User: @${fb.username || 'unknown'}\n` +
                    `💬 Comment: ${fb.comment}`;

                await bot.telegram.sendMessage(
                    Number(process.env.OPERATOR_CHAT_ID),
                    msg,
                    {
                        parse_mode: 'Markdown',
                        message_thread_id: process.env.THREAD_ID ? Number(process.env.THREAD_ID) : undefined
                    }
                );

                console.log(`[Alarm] Notification for feedback #${fb.id} sent to operator.`);
            }
        } catch (err: any) {
            console.error('[Monitor API] ❌ Error:', err.message);
        }
    }, 15000);
}