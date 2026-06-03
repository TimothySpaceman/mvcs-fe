"use client"

import {SWRConfig} from 'swr'
import {api} from '@/lib/api'
import {PropsWithChildren} from "react";

export function SWRProvider({children}: PropsWithChildren) {
    return (
        <SWRConfig value={{
            fetcher: (url: string) =>
                api.fetch(url, {auth: true}).then(res => {
                    if (!res.ok) throw new Error(res.statusText)
                    return res.json()
                })
        }}>
            {children}
        </SWRConfig>
    )
}