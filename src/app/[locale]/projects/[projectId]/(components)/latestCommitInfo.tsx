"use client";

import useSWR from "swr";
import {useQueryState, parseAsString} from "nuqs";
import {CommitInfo, CommitKinds, Ref} from "@/lib/entities/project";
import {Item, ItemContent, ItemTitle} from "@/components/ui/item";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo";
import {Spinner} from "@/components/ui/spinner";
import {GitDiffIcon, GitPullRequestIcon} from "@phosphor-icons/react";

type Props = {
    projectId: string;
    className?: string;
};

// TODO: Replace commit ID span with link
export default function LatestCommitInfo({projectId, className}: Props) {
    const [refName] = useQueryState("refName", parseAsString);
    const [commitId] = useQueryState("commitId", parseAsString);

    const {data: refs, isLoading} = useSWR<Ref[]>(`/projects/${projectId}/vcs/refs`);
    const refCommitId = refName ? refs?.find(r => r.name === refName)?.commitId : null;

    const resolvedId = commitId ?? refCommitId;
    const {data: commit} = useSWR<CommitInfo>(
        resolvedId ? `/projects/${projectId}/vcs/commits/${resolvedId}/info` : null
    );
    const {data: author} = useSWR<User>(commit?.author.id ? `/users/${commit.author.id}` : null);

    if (!commit) return null;

    const authorDisplayName = author?.displayName;
    const authorLabel = authorDisplayName && authorDisplayName !== commit.author.name
        ? `${authorDisplayName} (${commit.author.name})`
        : (authorDisplayName ?? commit.author.name);

    const date = new Date(commit.createdAt);
    const day = date.toLocaleDateString();

    return (
        <Item className={className} variant="outline">
            <ItemContent className="w-full">
                {isLoading
                    ? <ItemTitle>
                        <Spinner className="size-5 m-1 text-muted-foreground"/>
                    </ItemTitle>
                    : <ItemTitle className="w-full flex justify-between gap-3">
                        <div className="flex items-center sm:gap-2 min-w-0">
                            <UserInfo
                                avatarSize="sm"
                                avatarUrl={author?.avatar?.url}
                                label={authorLabel}
                                className={className}
                                labelClassName="max-sm:hidden"
                            />
                            <div className="text-foreground truncate flex gap-1 items-center">
                                {commit.kind === CommitKinds.merge && <GitPullRequestIcon className="size-4"/>}
                                {commit.kind === CommitKinds.revert && <GitDiffIcon className="size-4"/>}
                                {commit.message}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <span className="text-muted-foreground/60 shrink-0" title={date.toLocaleString()}>
                            {day}
                        </span>
                            <span
                                title={commit.id}
                                className="font-mono text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                            {commit.id.slice(0, 8)}
                        </span>
                        </div>
                    </ItemTitle>}
            </ItemContent>
        </Item>
    );
}