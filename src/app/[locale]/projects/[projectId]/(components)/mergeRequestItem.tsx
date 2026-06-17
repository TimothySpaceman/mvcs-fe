"use client";

import {MergeRequest} from "@/lib/entities/project";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowRightIcon, GitPullRequestIcon} from "@phosphor-icons/react";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo";
import {parseAsString, useQueryState} from "nuqs";
import {twMerge} from "tailwind-merge";

type Props = {
    mergeRequest: MergeRequest;
};

export default function MergeRequestItem({mergeRequest}: Props) {
    const {data: author} = useSWR<User>(`/users/${mergeRequest.authorId}`);

    const [, setTab] = useQueryState("tab", parseAsString.withDefault("files"));
    const [, setRefName] = useQueryState("refName", parseAsString);
    const [, setCommitId] = useQueryState("commitId", parseAsString);

    async function handleBranchClick(refName: string) {
        await setCommitId(null);
        await setRefName(refName);
        await setTab("files");
    }

    const date = new Date(mergeRequest.createdAt);
    const day = date.toLocaleDateString();

    const branchClassName = twMerge(
        "font-mono text-foreground/70 hover:text-foreground",
        "transition-colors cursor-pointer"
    );

    return (
        <Card className="!p-2">
            <CardHeader className="!p-0 min-w-0">
                <CardTitle className="truncate flex items-center gap-1.5">
                    <GitPullRequestIcon className="size-4 shrink-0 text-muted-foreground"/>
                    <span className="truncate">{mergeRequest.title}</span>
                </CardTitle>
                <CardAction>
                    <span
                        title={mergeRequest.mergeCommitId}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        {mergeRequest.mergeCommitId.slice(0, 8)}
                    </span>
                </CardAction>
                <CardDescription className="flex flex-col gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className={branchClassName}
                            onClick={() => handleBranchClick(mergeRequest.sourceRefName)}
                        >
                            {mergeRequest.sourceRefName}
                        </button>
                        <ArrowRightIcon/>
                        <button
                            type="button"
                            className={branchClassName}
                            onClick={() => handleBranchClick(mergeRequest.targetRefName)}
                        >
                            {mergeRequest.targetRefName}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {author && <UserInfo
                            avatarUrl={author.avatar?.url}
                            avatarSize="sm"
                            label={author.displayName}
                        />}
                        <span className="text-muted-foreground/60 shrink-0" title={date.toLocaleString()}>
                            {day}
                        </span>
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}