"use client";

import {Project} from "@/lib/entities/project";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo";
import {twMerge} from "tailwind-merge";

type Props = {
    project: Project;
};

export default function ProjectCard({project}: Props) {
    const t = useTranslations("ProjectCard");

    const {data: author} = useSWR<User>(`/users/${project.authorId}`);

    const updatedAt = new Date(project.updatedAt);

    return (
        <Link href={`/projects/${project.id}`}>
            <Card className={twMerge(
                "!p-2 cursor-pointer hover:bg-muted/30 transition-colors duration-100"
            )}>
                <CardHeader className="!p-0 min-w-0">
                    <CardTitle className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{project.title}</span>
                        {project.isPublic && (
                            <Badge variant="secondary" className="shrink-0">
                                {t("badge-public")}
                            </Badge>
                        )}
                    </CardTitle>
                    {project.description && project.description.trim().length > 0 && (
                        <CardDescription className="truncate">
                            {project.description}
                        </CardDescription>
                    )}
                    <CardDescription className="flex items-center justify-between gap-2 flex-wrap">
                        {author && (
                            <UserInfo
                                avatarUrl={author.avatar?.url}
                                avatarSize="sm"
                                label={author.displayName}
                            />
                        )}
                        <span
                            className="text-muted-foreground/60 shrink-0 text-xs"
                            title={updatedAt.toLocaleString()}
                        >
                            {updatedAt.toLocaleDateString()}
                        </span>
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}