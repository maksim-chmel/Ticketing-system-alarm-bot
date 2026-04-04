import dotenv from 'dotenv';

dotenv.config();

import { Telegraf } from 'telegraf';
import { config } from './config';
import { monitorNewFeedbacks } from './monitor';

let bot: Telegraf;

try {
    bot = new Telegraf(config.botToken);
} catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown configuration error';
    console.error(`Configuration error: ${message}`);
    process.exit(1);
}

bot.start((ctx) => ctx.reply('🤖 Bot online'));

monitorNewFeedbacks(bot)
    .then(() => console.log('Bot monitoring started'))
    .catch((error) => console.error('Failed to start monitor:', error));


bot.launch().then(() => console.log('Bot is ready'));

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
