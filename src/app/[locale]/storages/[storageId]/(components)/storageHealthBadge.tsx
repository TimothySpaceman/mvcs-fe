"use client";

import {Badge} from "@/components/ui/badge";
import {ReactNode, useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {Spinner} from "@/components/ui/spinner";
import {CheckCircleIcon, WarningCircleIcon, XCircleIcon} from "@phosphor-icons/react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {api} from "@/lib/api";
import {StorageHealth} from "@/lib/entities/storage";

const REFRESH_INTERVAL = 10000;

type Props = {
    storageId: string;
}

const Statuses = {
    unknown: "unknown",
    loading: "loading",
    healthy: "healthy",
    unreachable: "unreachable",
    error: "error",
} as const;
type Status = keyof typeof Statuses;

const icons: { [key: string]: ReactNode } = {
    unknown: null,
    loading: null,
    healthy: <CheckCircleIcon data-icon="inline-start"/>,
    unreachable: <WarningCircleIcon data-icon="inline-start"/>,
    error: <XCircleIcon data-icon="inline-start"/>,
}

const classNames = {
    unknown: "",
    loading: "",
    healthy: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    unreachable: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    error: "",
}

const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
    unknown: "secondary",
    loading: "secondary",
    healthy: "default",
    unreachable: "default",
    error: "destructive",
}

export default function StorageHealthBadge({storageId}: Props) {
    const t = useTranslations("StoragePage.health")

    const [status, setStatus] = useState<Status>(Statuses.unknown);
    const [details, setDetails] = useState<string>();

    useEffect(() => {
        let cancelled = false;
        let controller = new AbortController();

        async function checkHealth() {
            controller.abort();
            controller = new AbortController();
            setStatus(Statuses.loading);
            setDetails(undefined);

            try {
                const resp = await api.fetch(`/storages/${storageId}/health`, {
                    auth: true,
                    signal: controller.signal
                });
                if (cancelled) return;

                if (!resp.ok) {
                    setStatus(Statuses.error);
                    setDetails(t(resp.status >= 500 ? "error-internal-server" : "error-failed"));
                    return;
                }

                const body = await resp.json() as StorageHealth;
                setStatus(body.isReachable ? Statuses.healthy : Statuses.unreachable);
                setDetails(body.error ?? undefined);
            } catch {
                if (cancelled) return;
                setStatus(Statuses.error);
                setDetails(t("error-internal-server"));
            }
        }

        checkHealth();
        const interval = setInterval(() => checkHealth(), REFRESH_INTERVAL);
        return () => {
            cancelled = true;
            clearInterval(interval);
            controller.abort();
        }
    }, [])

    return <HoverCard openDelay={10} closeDelay={100}>
        <HoverCardTrigger asChild>
            <Badge className={classNames[status]} variant={variants[status]}>
                {status === Statuses.loading && <Spinner data-icon="inline-start"/>}
                {icons[status]}
                {t(`badge-${status}`)}
            </Badge>
        </HoverCardTrigger>
        {details && <HoverCardContent className="p-1 w-max">
            {details}
        </HoverCardContent>}
    </HoverCard>
}