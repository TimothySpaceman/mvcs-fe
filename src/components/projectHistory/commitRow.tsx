"use client";

import {CommitInfo, CommitKinds} from "@/lib/entities/project";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import CommitAuthor from "@/components/projectHistory/commitAuthor";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {parseAsString, useQueryState} from "nuqs";
import {GitDiffIcon, GitPullRequestIcon} from "@phosphor-icons/react";

// TODO: Replace id copying with commit details page
export default function CommitRow({commit}: { commit: CommitInfo }) {
    const t = useTranslations("ProjectPage.history");

    const [, setTab] = useQueryState("tab", parseAsString.withDefault("files"));
    const [, setCommitId] = useQueryState("commitId", parseAsString);

    const date = new Date(commit.createdAt);
    const day = date.toLocaleDateString();

    async function handleCopyId() {
        try {
            await navigator.clipboard.writeText(commit.id);
            toast.success(t("toast-copied"));
        } catch {
            toast.error(t("toast-copy-failed"));
        }
    }

    async function handleGoToCommit() {
        await setCommitId(commit.id);
        await setTab("files");
    }

    return (
        <Card className="!p-2">
            <CardHeader className="!p-0 min-w-0">
                <CardTitle className="truncate">
                    <button
                        type="button"
                        onClick={handleGoToCommit}
                        className="hover:underline text-left flex gap-1 items-center"
                    >
                        {commit.kind === CommitKinds.merge && <GitPullRequestIcon className="size-4"/>}
                        {commit.kind === CommitKinds.revert && <GitDiffIcon className="size-4"/>}
                        {commit.message}
                    </button>
                </CardTitle>
                <CardAction>
                    <button
                        type="button"
                        onClick={handleCopyId}
                        title={commit.id}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        {commit.id.slice(0, 8)}
                    </button>
                </CardAction>
                <CardDescription className="flex items-center gap-1">
                    <CommitAuthor author={commit.author}/>
                    <span className="text-muted-foreground/60 shrink-0" title={date.toLocaleString()}>
                        {day}
                    </span>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}