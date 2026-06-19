"use client";

import useSWRInfinite from "swr/infinite";
import {useEffect} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Release} from "@/lib/entities/project";
import {twMerge} from "tailwind-merge";
import {VinylRecordIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {PagedResult} from "@/lib/entities/common";
import ReleaseCard from "@/app/[locale]/projects/[projectId]/(components)/releaseCard";

const ITEMS_PER_PAGE = 20;

type Props = {
    projectId: string;
    onMutateReady?: (mutate: () => void) => void;
    className?: string;
};

export default function ReleasesList({projectId, onMutateReady, className}: Props) {
    const t = useTranslations("ProjectPage.releases");

    const {data: pages, error, isLoading, isValidating, size, setSize, mutate} = useSWRInfinite<PagedResult<Release>>(
        (index, prev: PagedResult<Release> | null) => {
            if (prev && prev.page * prev.itemsPerPage >= prev.totalItems) return null;

            const params = new URLSearchParams({
                page: `${index + 1}`,
                itemsPerPage: `${ITEMS_PER_PAGE}`,
            });

            return `/projects/${projectId}/releases?${params.toString()}`;
        },
        {revalidateFirstPage: false}
    );

    useEffect(() => {
        onMutateReady?.(() => void mutate());
    }, [onMutateReady, mutate]);

    const releases = pages?.flatMap(p => p.items) ?? [];
    const last = pages?.at(-1);
    const hasMore = !!last && last.page * last.itemsPerPage < last.totalItems;

    if (isLoading) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <Spinner className="size-8"/>
            <span className="text-muted-foreground">{t("label-loading")}</span>
        </div>
    );

    if (error) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6 text-destructive", className)}>
            <WarningCircleIcon className="size-8"/>
            <span>{t("error-failed")}</span>
        </div>
    );

    if (releases.length === 0) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <VinylRecordIcon className="size-8 text-muted-foreground"/>
            <span className="text-muted-foreground">{t("label-empty")}</span>
        </div>
    );

    return (
        <div className={twMerge("flex flex-col gap-2", className)}>
            {releases.map((release) => (
                <ReleaseCard key={release.id} release={release} projectId={projectId}/>
            ))}
            {hasMore && <div className="flex justify-center mt-2">
                <Button
                    variant="ghost"
                    disabled={isValidating}
                    onClick={() => setSize(size + 1)}
                >
                    {isValidating && <Spinner className="size-4" data-icon="inline-start"/>}
                    {t("label-load-more")}
                </Button>
            </div>}
        </div>
    );
}