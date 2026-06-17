export type PagedResult<T> = {
    items: T[];
    page: number;
    itemsPerPage: number;
    totalItems: number;
};

export type CursorPagedResult<T> = {
    items: T[];
    limit: number;
    nextCursor: string | null;
};