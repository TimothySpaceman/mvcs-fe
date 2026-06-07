"use client";

import {Badge} from "@/components/ui/badge";
import {ReactNode, useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {Spinner} from "@/components/ui/spinner";
import {CheckCircleIcon, WarningCircleIcon, XCircleIcon} from "@phosphor-icons/react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {api} from "@/lib/api";
import {ProjectHealth} from "@/lib/entities/project";

type Props = {
    projectId: string;
    className?: string;
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

export default function ProjectHealthBadge({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.health")

    const [status, setStatus] = useState<Status>(Statuses.unknown);
    const [details, setDetails] = useState<string>();

    async function checkHealth() {
        setStatus(Statuses.loading);
        setDetails(undefined);

        try {
            const resp = await api.fetch(`/projects/${projectId}/health`, {auth: true});

            if (!resp.ok) {
                setStatus(Statuses.error);
                setDetails(t(resp.status >= 500 ? "error-internal-server" : "error-failed"));
                return;
            }

            const body = await resp.json() as ProjectHealth;
            setStatus(body.isReachable ? Statuses.healthy : Statuses.unreachable);
            setDetails(body.error ?? undefined);
        } catch {
            setStatus(Statuses.error);
            setDetails(t("error-internal-server"));
        }
    }

    useEffect(() => {
        checkHealth();
    }, [])

    return <HoverCard openDelay={10} closeDelay={100}>
        <HoverCardTrigger asChild className={className}>
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