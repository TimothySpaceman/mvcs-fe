export type ApiRequestOptions = RequestInit & {
    retry?: boolean
    auth?: boolean
}

export type ApiRequest = {
    url: string | URL
    options: ApiRequestOptions
}

export type NeedsRefreshHandler = (response: Response) => boolean
export type RefreshHandler = (client: ApiClient) => Promise<boolean>

export type ApiClientInit = {
    host: string
    needsRefresh: NeedsRefreshHandler
    refresh: RefreshHandler
    cookies?: string
}

type QueueSlot = {
    request: ApiRequest
    onReady: () => Promise<void>
    onAbort: () => void
}

export class ApiClient {
    private readonly host: string
    private readonly cookies?: string

    private readonly needsRefresh: NeedsRefreshHandler
    private readonly refresh: RefreshHandler

    private queue: QueueSlot[] = []
    private isRefreshing: boolean = false

    constructor({host, needsRefresh, refresh, cookies}: ApiClientInit) {
        this.host = host
        this.cookies = cookies
        this.needsRefresh = needsRefresh
        this.refresh = refresh;
    }

    private completeOptions(options: ApiRequestOptions): ApiRequestOptions {
        const auth = options.auth ?? false;
        const cookieHeader: HeadersInit = this.cookies ? {Cookie: this.cookies} : {};
        return {
            credentials: "include",
            auth,
            retry: options.retry ?? auth,
            ...options,
            headers: {
                ...cookieHeader,
                ...options.headers,
            }
        }
    }

    private perform(request: ApiRequest) {
        return fetch(`${this.host}${request.url}`, request.options);
    }

    private enqueue(request: ApiRequest): Promise<Response> {
        return new Promise((resolve, reject) => {
            const onReady = () => this.perform(request).then(resolve).catch(reject);
            const onAbort = () => reject(new Error("Auth refresh failed"));
            this.queue.push({request, onReady, onAbort});
        })
    }

    public async fetch(
        url: string | URL,
        options: ApiRequestOptions = {}
    ) {
        const fullOptions = this.completeOptions(options);
        const request: ApiRequest = {url, options: fullOptions};

        if (!fullOptions.auth) return this.perform(request);

        if (this.isRefreshing) return this.enqueue(request);

        let response = await this.perform(request);
        if (!fullOptions.retry || !this.needsRefresh(response)) return response;

        this.isRefreshing = true;
        try {
            const success = await this.refresh(this);
            if (success) {
                response = await this.perform(request);
                await Promise.allSettled(
                    this.queue.splice(0).map(enqueued => enqueued.onReady())
                );
            } else {
                this.queue.splice(0).forEach(enqueued => enqueued.onAbort());
            }
            return response;
        } finally {
            this.isRefreshing = false;
        }
    }
}
