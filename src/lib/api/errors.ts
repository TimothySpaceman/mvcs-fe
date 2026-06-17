export class ApiError extends Error {
    readonly status: number;
    readonly statusText: string;

    constructor(status: number, statusText: string) {
        super(statusText);
        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
    }

    get isNotFound() {
        return this.status === 404;
    }

    get isForbidden() {
        return this.status === 403;
    }

    get isUnauthorized() {
        return this.status === 401;
    }

    get isServerError() {
        return this.status >= 500;
    }
}
