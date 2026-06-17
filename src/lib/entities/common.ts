export type PagedResult<T> = {
    items: T[];
    page: number;
    itemsPerPage: number;
    totalItems: number;
};