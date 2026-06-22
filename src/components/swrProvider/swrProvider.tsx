"use client"

import {SWRConfig} from 'swr'
import {api} from '@/lib/api'
import {PropsWithChildren} from "react";
import {ApiError} from "@/lib/api/errors";

export function SWRProvider({children}: PropsWithChildren) {
    return (
        <SWRConfig value={{
            fetcher: (url: string) =>
                api.fetch(url, {auth: true}).then(res => {
                    if (!res.ok) throw new ApiError(res.status, res.statusText);
                    return res.json();
                })
        }}>
            {children}
        </SWRConfig>
    )
}