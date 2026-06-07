import {getTranslations} from "next-intl/server";
import {twMerge} from "tailwind-merge";
import {Badge} from "@/components/ui/badge";
import {Project} from "@/lib/entities/project";
import {User} from "@/lib/auth/types";
import ProjectHealthBadge from "@/app/[locale]/projects/[projectId]/(components)/projectHealthBadge";
import UserInfo from "@/components/userInfo";
import CopyId from "@/app/[locale]/projects/[projectId]/(components)/copyId";

type Props = {
    project: Project,
    author?: User,
    className?: string
}

// TODO: Replace span with link for author
export default async function ProjectInfo({project, author, className}: Props) {
    const t = await getTranslations("ProjectPage.info");

    return <div className={twMerge("flex flex-col gap-1", className)}>
        <div className="flex gap-2 flex-wrap items-center">
            <h1 className="font-bold text-2xl">{project.title}</h1>
            {project.isPublic && <Badge variant="secondary">
                {t("badge-public")}
            </Badge>}

            <ProjectHealthBadge projectId={project.id} className="ml-auto mr-0"/>
        </div>
        {project.description && project.description.trim().length > 0 && <p
            className="text-muted-foreground"
        >
            {project.description}
        </p>}
        <div className="flex gap-2 flex-wrap items-center justify-between">
            {author && <UserInfo
                avatarUrl={author.avatar?.url}
                label={author.displayName}
                labelClassName="text-foreground"
            />}
            <CopyId projectId={project.id} className="text-xs text-muted-foreground/60"/>
        </div>
    </div>
}