import dotenv from 'dotenv';

dotenv.config();

import { Telegraf } from 'telegraf';
import { monitorNewFeedbacks } from './monitor';


const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN not found in .env");
    process.exit(1);
}

const bot = new Telegraf(token);


bot.start((ctx) => ctx.reply('🤖 Bot online'));

monitorNewFeedbacks(bot)
    .then(() => console.log('🚀 Start'))
    .catch(err => console.error('💥 Error:', err));


bot.launch().then(() => console.log('✅ Ready to work'));

bot.command('id', (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from?.id;
    const threadId = ctx.message?.message_thread_id;

    ctx.reply(
        `Chat ID: ${chatId}\nUser ID: ${userId}` +
        (threadId ? `\nThread ID: ${threadId}` : '')
    );
});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));