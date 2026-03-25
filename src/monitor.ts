import { Telegraf } from 'telegraf';
import { pool } from './db';


function escapeMarkdownV2(text: string): string {
    if (!text) return '';
    return text
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-')
        .replace(/=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/!/g, '\\!');
}


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
    console.log('✅ Monitoring started');

   
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

              
                const msg = `🆕 Request ID: *${Id}*
📱 Phone: \`${escapeMarkdownV2(Phone)}\`
👤 Telegram: @${escapeMarkdownV2(Username || 'N_A')}
🕒 ${escapeMarkdownV2(new Date(CreatedDate).toLocaleString())}
💬 ${escapeMarkdownV2(Comment)}`;

                
                await bot.telegram.sendMessage(
                    Number(process.env.OPERATOR_CHAT_ID),
                    msg,
                    {
                        parse_mode: 'MarkdownV2',
                        message_thread_id: process.env.THREAD_ID ? Number(process.env.THREAD_ID) : undefined
                    }
                );

               
                await pool.query(
                    `INSERT INTO "SentFeedbacks" ("FeedbackId")
                     VALUES ($1)
                         ON CONFLICT ("FeedbackId") DO NOTHING;`,
                    [Id]
                );
            }

        } catch (err) {
            console.error('[Monitor] ❌ Error:', err);
        }
    }, 15000);
}