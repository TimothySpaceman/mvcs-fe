"use client";

import useSWRInfinite from "swr/infinite";
import {useQueryState, parseAsString} from "nuqs";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {CommitInfo} from "@/lib/entities/project";
import {twMerge} from "tailwind-merge";
import {CursorPage} from "@/lib/api/types";
import {ClockCountdownIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {Fragment} from "react";
import Separator from "@/components/projectHistory/separator";
import CommitRow from "@/components/projectHistory/commitRow";

const ITEMS_PER_PAGE = 30;

type Props = {
    projectId: string;
    className?: string;
};

export default function ProjectHistory({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.history");

    const [refName] = useQueryState("refName", parseAsString);
    const [commitId] = useQueryState("commitId", parseAsString);

    const {data: pages, error, isLoading, isValidating, size, setSize} = useSWRInfinite<CursorPage<CommitInfo>>(
        (index, prev: CursorPage<CommitInfo> | null) => {
            if (prev && !prev.nextCursor) return null;

            const params = new URLSearchParams();
            if (refName) params.set("refName", refName);
            if (index === 0 && commitId) params.set("commitId", commitId);
            if (prev?.nextCursor) params.set("fromId", prev.nextCursor);
            params.set("limit", `${ITEMS_PER_PAGE}`);

            return `/projects/${projectId}/vcs/commits?${params.toString()}`;
        },
        {revalidateFirstPage: false}
    );

    const commits = pages?.flatMap(p => p.items) ?? [];
    const commitsByDay = Object.groupBy(commits, (commit) =>
        new Date(commit.createdAt).toLocaleDateString()
    );
    const hasMore = !!pages?.at(-1)?.nextCursor;

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

    if (commits.length === 0) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <ClockCountdownIcon className="size-8"/>
            <span>{t("label-empty")}</span>
        </div>
    );

    return (
        <div className={className}>
            {Object.entries(commitsByDay).map(([date, dayCommits]) => (
                <Fragment key={`commits-from-${date}`}>
                    <Separator>{t("label-day-group", {day: date})}</Separator>
                    {dayCommits!.map((commit, idx, arr) => <Fragment key={commit.id}>
                        <CommitRow key={commit.id} commit={commit}/>
                        {idx < arr.length - 1 && <Separator/>}
                    </Fragment>)}
                </Fragment>
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