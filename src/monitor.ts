import { Telegraf } from 'telegraf';
import { pool } from './db';

async function ensureSentFeedbacksTableExists() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "SentFeedbacks" (
            "Id" SERIAL PRIMARY KEY,
            "FeedbackId" INTEGER NOT NULL UNIQUE,
            "SentAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function monitorNewFeedbacks(bot: Telegraf) {
    console.log('✅ Мониторинг запущен');

    await ensureSentFeedbacksTableExists();

    setInterval(async () => {
        try {
            const res = await pool.query(`
                SELECT f."Id", u."Phone", u."Username", f."Comment", f."CreatedDate"
                FROM "Feedbacks" f
                JOIN "Users" u ON f."UserId" = u."UserId"
                LEFT JOIN "SentFeedbacks" s ON f."Id" = s."FeedbackId"
                WHERE s."FeedbackId" IS NULL
                ORDER BY f."Id" ASC;
            `);

            for (const row of res.rows) {
                const { Id, Phone, Username, Comment, CreatedDate } = row;

                const msg = `🆕 Заявка ID: *${Id}*
📱 Телефон: \`${Phone}\`
👤 Telegram: @${Username || 'N/A'}
🕒 ${new Date(CreatedDate).toLocaleString()}
💬 ${Comment}`;

                await bot.telegram.sendMessage(Number(process.env.OPERATOR_CHAT_ID), msg, {
                    parse_mode: 'Markdown',
                    message_thread_id: process.env.THREAD_ID ? Number(process.env.THREAD_ID) : undefined
                });

                await pool.query(`
                    INSERT INTO "SentFeedbacks" ("FeedbackId")
                    VALUES ($1)
                    ON CONFLICT ("FeedbackId") DO NOTHING;
                `, [Id]);
            }

        } catch (err) {
            console.error('[Monitor] ❌ Ошибка:', err);
        }
    }, 15000);
}