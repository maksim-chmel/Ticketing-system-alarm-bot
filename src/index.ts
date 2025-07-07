import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();
import { monitorNewFeedbacks } from './monitor';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(ctx => ctx.reply('Сервис онлайн.'));
monitorNewFeedbacks(bot);

bot.launch().then(() => console.log('Бот запущено'));