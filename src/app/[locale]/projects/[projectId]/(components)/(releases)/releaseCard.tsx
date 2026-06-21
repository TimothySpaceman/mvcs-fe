"use client";

import {useMemo} from "react";
import {hasAccess, ProjectAccessLevel, Release} from "@/lib/entities/project";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {VinylRecordIcon} from "@phosphor-icons/react";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo/userInfo";
import ReleaseFileRow from "@/app/[locale]/projects/[projectId]/(components)/(releases)/releaseFileRow";

import ReleaseDeleteButton from "@/app/[locale]/projects/[projectId]/(components)/(releases)/releaseDeleteButton";
import {useUser} from "@/components/userProvider/userProvider";
import {isAudioFile} from "@/components/player/config";

type Props = {
    release: Release;
    projectId: string;
    accessLevel: ProjectAccessLevel | null;
    onDeleted?: () => void;
};

export default function ReleaseCard({release, projectId, accessLevel, onDeleted}: Props) {
    const {user} = useUser();
    const {data: author} = useSWR<User>(release.authorId ? `/users/${release.authorId}` : null);

    const date = new Date(release.createdAt);
    const day = date.toLocaleDateString();

    const isOwner = hasAccess(accessLevel, "owner");
    const isAuthorWithWrite = hasAccess(accessLevel, "write")
        && !!release.authorId
        && release.authorId === user?.id;
    const canDelete = isOwner || isAuthorWithWrite;

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
                <CardTitle className="text-lg truncate">
                    {release.title}
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
                {canDelete && (
                    <CardAction>
                        <ReleaseDeleteButton
                            projectId={projectId}
                            releaseId={release.id}
                            onDeleted={onDeleted}
                        />
                    </CardAction>
                )}
            </CardHeader>

            <div className="border border-border">
                {sortedFiles.map((file) => (
                    <ReleaseFileRow key={file.id} file={file} projectId={projectId}/>
                ))}
            </div>
        </Card>
    );
}