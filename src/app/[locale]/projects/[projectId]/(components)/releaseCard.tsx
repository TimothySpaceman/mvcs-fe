"use client";

import {useMemo} from "react";
import {Release} from "@/lib/entities/project";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {VinylRecordIcon} from "@phosphor-icons/react";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo/userInfo";
import ReleaseFileRow from "@/app/[locale]/projects/[projectId]/(components)/releaseFileRow";
import {isAudioFile} from "@/components/player/config";

type Props = {
    release: Release;
    projectId: string;
};

export default function ReleaseCard({release, projectId}: Props) {
    const {data: author} = useSWR<User>(release.authorId ? `/users/${release.authorId}` : null);

    const date = new Date(release.createdAt);
    const day = date.toLocaleDateString();

    const sortedFiles = useMemo(() => {
        return release.files
            .map((file, index) => ({file, index}))
            .sort((a, b) => {
                const audioDiff = Number(isAudioFile(b.file.fileName)) - Number(isAudioFile(a.file.fileName));
                return audioDiff !== 0 ? audioDiff : a.index - b.index;
            })
            .map(({file}) => file);
    }, [release.files]);

    return (
        <Card className="!p-2 gap-2">
            <CardHeader className="!p-0 min-w-0">
                <CardTitle className="truncate flex items-center gap-1.5">
                    <VinylRecordIcon className="size-4 shrink-0 text-muted-foreground"/>
                    <span className="truncate">{release.title}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                    {author && <UserInfo
                        avatarUrl={author.avatar?.url}
                        avatarSize="sm"
                        label={author.displayName}
                    />}
                    <span className="text-muted-foreground/60 shrink-0" title={date.toLocaleString()}>
                        {day}
                    </span>
                </CardDescription>
            </CardHeader>

            <div className="border border-border">
                {sortedFiles.map((file) => (
                    <ReleaseFileRow key={file.id} file={file} projectId={projectId}/>
                ))}
            </div>
        </Card>
    );
}