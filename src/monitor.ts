import { Telegraf } from 'telegraf';
import { config } from './config';
import { AdminPanelApi, FeedbackDto } from './adminPanelApi';

interface Feedback {
    id: number;
    phone?: string | null;
    username?: string | null;
    comment?: string | null;
    date?: string | null;
}

function mapFeedbackDto(dto: FeedbackDto): Feedback {
    return {
        id: dto.id,
        phone: dto.phone ?? null,
        username: dto.username ?? null,
        comment: dto.comment ?? null,
        date: dto.date ?? dto.createdDate ?? null
    };
}

function escapeMarkdown(value: string): string {
    return value.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function formatFeedbackTime(date?: string | null): string {
    if (!date) {
        return 'Just now';
    }

    return new Date(date).toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
    });
}

function buildFeedbackMessage(feedback: Feedback): string {
    const username = feedback.username ? `@${feedback.username}` : 'unknown';
    const comment = feedback.comment?.trim() || 'No comment provided';

    return `🆕 *New Feedback #${feedback.id}*\n` +
        `📅 Time: \`${escapeMarkdown(formatFeedbackTime(feedback.date))}\`\n` +
        `📱 Phone: \`${escapeMarkdown(feedback.phone || 'N/A')}\`\n` +
        `👤 User: ${escapeMarkdown(username)}\n` +
        `💬 Comment: ${escapeMarkdown(comment)}`;
}

export async function monitorNewFeedbacks(bot: Telegraf) {
    console.log('API monitoring started');
    let isPolling = false;
    const api = new AdminPanelApi(config.apiBaseUrl);

    setInterval(async () => {
        if (isPolling) {
            console.warn('Skipping poll because previous cycle is still running');
            return;
        }

        isPolling = true;

        try {
            const feedbackDtos = await api.pullUnnotifiedFeedbacks();
            const feedbacks = feedbackDtos.map(mapFeedbackDto);

            if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
                return;
            }

            for (const feedback of feedbacks) {
                await bot.telegram.sendMessage(
                    config.operatorChatId,
                    buildFeedbackMessage(feedback),
                    {
                        parse_mode: 'Markdown',
                        message_thread_id: config.threadId
                    }
                );

                console.log(`Notification for feedback #${feedback.id} sent to operator`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown monitor error';
            console.error(`Monitor API error: ${message}`);
        } finally {
            isPolling = false;
        }
    }, config.pollIntervalMs);
}
