const DEFAULT_API_BASE_URL = 'http://adminpanel-back:8080/api';
const DEFAULT_POLL_INTERVAL_MS = 15000;

function readOptionalBoolean(name: string): boolean | undefined {
    const value = process.env[name];
    if (!value) return undefined;

    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;

    throw new Error(`Environment variable ${name} must be a boolean (true/false)`);
}

function readRequiredNumber(name: string): number {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }

    return parsed;
}

function readOptionalNumber(name: string): number | undefined {
    const value = process.env[name];

    if (!value) {
        return undefined;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }

    return parsed;
}

function readBotToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN ?? process.env.BOT_TOKEN;

    if (!token) {
        throw new Error('Missing required environment variable: TELEGRAM_BOT_TOKEN or BOT_TOKEN');
    }

    return token;
}

export const config = {
    apiBaseUrl: process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL,
    botToken: readBotToken(),
    operatorChatId: readRequiredNumber('OPERATOR_CHAT_ID'),
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
    threadId: readOptionalNumber('THREAD_ID'),
    enableBroadcastPolling: readOptionalBoolean('ENABLE_BROADCAST_POLLING') ?? true
};
