export type CursorPage<T> = {
    items: T[];
    limit: number;
    nextCursor: string | null;
};