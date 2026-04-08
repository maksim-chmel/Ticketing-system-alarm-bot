import axios, { AxiosInstance } from 'axios';

export interface UserDto {
    userId: number;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    comments?: string | null;
}

export interface FeedbackDto {
    id: number;
    userId?: number;
    comment?: string | null;
    createdDate?: string | null;
    status?: string | number | null;

    phone?: string | null;
    username?: string | null;
    date?: string | null;
}

export interface BroadcastMessage {
    id: number;
    message: string;
    created?: string;
    isActive?: boolean;
}

export class AdminPanelApi {
    private readonly http: AxiosInstance;
    private readonly userCache = new Map<number, { user: UserDto; expiresAt: number }>();
    private readonly userCacheTtlMs = 5 * 60 * 1000;

    constructor(baseUrl: string) {
        this.http = axios.create({
            baseURL: baseUrl.replace(/\/+$/, ''),
            timeout: 10000
        });
    }

    async pullUnnotifiedFeedbacks(): Promise<FeedbackDto[]> {
        const { data } = await this.http.post<FeedbackDto[]>('/operator/unnotified-feedback-pulls');
        return Array.isArray(data) ? data : [];
    }

    async pullBroadcastMessages(): Promise<BroadcastMessage[]> {
        const { data } = await this.http.post<BroadcastMessage[]>('/operator/broadcast-message-pulls');
        return Array.isArray(data) ? data : [];
    }

    async getUser(userId: number): Promise<UserDto> {
        const now = Date.now();
        const cached = this.userCache.get(userId);
        if (cached && cached.expiresAt > now) {
            return cached.user;
        }

        const { data } = await this.http.get<UserDto>(`/operator/users/${userId}`);
        this.userCache.set(userId, { user: data, expiresAt: now + this.userCacheTtlMs });
        return data;
    }
}

