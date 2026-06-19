"use client";

import {Release} from "@/lib/entities/project";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo/userInfo";
import ReleaseFileRow from "@/app/[locale]/projects/[projectId]/(components)/releaseFileRow";

type Props = {
    release: Release;
    projectId: string;
};

export default function ReleaseCard({release, projectId}: Props) {
    const {data: author} = useSWR<User>(release.authorId ? `/users/${release.authorId}` : null);

    const date = new Date(release.createdAt);
    const day = date.toLocaleDateString();

    return (
        <Card className="!p-2 gap-2">
            <CardHeader className="!p-0 min-w-0">
                <CardTitle className="text-lg truncate flex items-center gap-1.5">
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
            </CardHeader>

            <div className="border border-border">
                {release.files.map((file) => (
                    <ReleaseFileRow key={file.id} file={file} projectId={projectId}/>
                ))}
            </div>
        </Card>
    );
}