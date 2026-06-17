"use client";

import useSWR from "swr";
import {useTranslations} from "next-intl";
import {Spinner} from "@/components/ui/spinner";
import {MergeRequest} from "@/lib/entities/project";
import {twMerge} from "tailwind-merge";
import {GitMergeIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {useState} from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {PagedResult} from "@/lib/entities/common";
import MergeRequestItem from "@/app/[locale]/projects/[projectId]/(components)/mergeRequestItem";

const ITEMS_PER_PAGE = 20;

type Props = {
    projectId: string;
    className?: string;
};

function buildPageRange(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
    if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];

    return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export default function MergeRequestsList({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.merges");

    const [page, setPage] = useState(1);

    const params = new URLSearchParams({
        page: `${page}`,
        itemsPerPage: `${ITEMS_PER_PAGE}`,
    });

    const {data, error, isLoading} = useSWR<PagedResult<MergeRequest>>(
        `/projects/${projectId}/vcs/merge-requests?${params.toString()}`
    );

    const totalPages = data ? Math.ceil(data.totalItems / ITEMS_PER_PAGE) : 0;

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

    if (data?.items.length === 0) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <GitMergeIcon className="size-8 text-muted-foreground"/>
            <span className="text-muted-foreground">{t("label-empty")}</span>
        </div>
    );

    const pageRange = buildPageRange(page, totalPages);

    return (
        <div className={twMerge("flex flex-col gap-2", className)}>
            {data?.items.map((mr) => (
                <MergeRequestItem key={mr.id} mergeRequest={mr}/>
            ))}

            {totalPages > 1 && (
                <Pagination className="mt-2">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => p - 1)}
                                aria-disabled={page <= 1}
                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {pageRange.map((item, idx) => (
                            <PaginationItem key={idx}>
                                {item === "ellipsis"
                                    ? <PaginationEllipsis/>
                                    : <PaginationLink
                                        isActive={item === page}
                                        onClick={() => setPage(item)}
                                        className="cursor-pointer"
                                    >
                                        {item}
                                    </PaginationLink>
                                }
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => p + 1)}
                                aria-disabled={page >= totalPages}
                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}