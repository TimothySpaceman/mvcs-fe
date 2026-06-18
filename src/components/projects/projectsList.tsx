"use client";

import useSWR from "swr";
import {useTranslations} from "next-intl";
import {parseAsInteger, parseAsString, useQueryState} from "nuqs";
import {Spinner} from "@/components/ui/spinner";
import {FolderSimpleDashedIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {Project} from "@/lib/entities/project";
import {PagedResult} from "@/lib/entities/common";
import {twMerge} from "tailwind-merge";
import ProjectCard from "@/components/projects/projectCard";

const ITEMS_PER_PAGE = 20;

type Props = {
    staticParams?: Record<string, string>;
};

function buildPageUrl(params: URLSearchParams, page: number): string {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    return `?${next.toString()}`;
}

function getPaginationPages(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);

    const pages: (number | "ellipsis")[] = [1];

    if (current > 3) pages.push("ellipsis");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("ellipsis");

    pages.push(total);
    return pages;
}

export default function ProjectsList({staticParams = {}}: Props) {
    const t = useTranslations("ProjectsList");

    const [page] = useQueryState("page", parseAsInteger.withDefault(1));
    const [search] = useQueryState("search", parseAsString.withDefault(""));
    const [isPublicFilter] = useQueryState("isPublic", parseAsString.withDefault("all"));
    const [authorId] = useQueryState("authorId", parseAsString);

    const params = new URLSearchParams(staticParams);
    params.set("page", String(page));
    params.set("itemsPerPage", String(ITEMS_PER_PAGE));
    if (search.trim()) params.set("search", search.trim());
    if (isPublicFilter !== "all") params.set("isPublic", isPublicFilter);
    if (authorId) params.set("authorId", authorId);

    const {data, error, isLoading} = useSWR<PagedResult<Project>>(
        `/projects?${params.toString()}`
    );

    const filterParams = new URLSearchParams();
    if (search.trim()) filterParams.set("search", search.trim());
    if (isPublicFilter !== "all") filterParams.set("isPublic", isPublicFilter);
    if (authorId) filterParams.set("authorId", authorId);

    if (isLoading) return (
        <div className="flex flex-col items-center gap-2 py-10">
            <Spinner className="size-8"/>
            <span className="text-muted-foreground">{t("label-loading")}</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center gap-2 py-10 text-destructive">
            <WarningCircleIcon className="size-8"/>
            <span>{t("error-failed")}</span>
        </div>
    );

    if (!data || data.items.length === 0) return (
        <div className="flex flex-col items-center gap-2 py-10">
            <FolderSimpleDashedIcon className="size-8"/>
            <span className="text-muted-foreground">{t("label-empty")}</span>
        </div>
    );

    const totalPages = Math.ceil(data.totalItems / ITEMS_PER_PAGE);
    const pages = getPaginationPages(page, totalPages);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                {data.items.map((project) => (
                    <ProjectCard key={project.id} project={project}/>
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={buildPageUrl(filterParams, page - 1)}
                                text={t("pagination-previous")}
                                aria-disabled={page <= 1}
                                className={twMerge(page <= 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>

                        {pages.map((p, idx) =>
                            p === "ellipsis" ? (
                                <PaginationItem key={`ellipsis-${idx}`}>
                                    <PaginationEllipsis/>
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        href={buildPageUrl(filterParams, p)}
                                        isActive={p === page}
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href={buildPageUrl(filterParams, page + 1)}
                                text={t("pagination-next")}
                                aria-disabled={page >= totalPages}
                                className={twMerge(page >= totalPages && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <p className="text-xs text-muted-foreground text-center">
                {t("label-total", {total: data.totalItems})}
            </p>
        </div>
    );
}