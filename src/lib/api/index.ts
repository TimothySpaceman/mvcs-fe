import {ApiClient, NeedsRefreshHandler, RefreshHandler} from "@/lib/api/client";
import {StatusCodes} from "http-status-codes";

const host = process.env.NEXT_PUBLIC_API_HOST ?? "";

const needsRefresh: NeedsRefreshHandler = (response) => response.status === StatusCodes.UNAUTHORIZED;

const refresh: RefreshHandler = async (client) => {
    const response = await client.fetch("/auth/refresh", {method: "POST"});
    return response.ok;
}

export const api = new ApiClient({host, needsRefresh, refresh});

export async function getServerApi(): Promise<ApiClient> {
    const {cookies} = await import('next/headers');
    const cookieStore = await cookies();

    return new ApiClient({
        host: process.env.API_HOST ?? host,
        cookies: cookieStore.toString(),
        needsRefresh,
        refresh
    });
}