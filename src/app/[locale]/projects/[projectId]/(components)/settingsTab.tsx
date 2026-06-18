import {Project} from "@/lib/entities/project";
import ProjectStorageInfo from "@/app/[locale]/projects/[projectId]/(components)/projectStorageInfo";
import {Separator} from "@/components/ui/separator";
import ProjectEditForm from "@/app/[locale]/projects/[projectId]/(components)/projectEditForm";
import {useTranslations} from "next-intl";
import ProjectAccessEditor from "@/app/[locale]/projects/[projectId]/(components)/projectAccessEditor";
import ProjectDeleteSection from "@/app/[locale]/projects/[projectId]/(components)/projectDeleteSection";

type Props = {
    project: Project;
}

export default function SettingsTab({project}: Props) {
    const t = useTranslations("ProjectPage.settings");

    return <div className="flex flex-col gap-1">
        <span className="text-base text-muted-foreground">
            {t("label-general")}
        </span>
        <ProjectEditForm project={project}/>

        {project.storageId && (
            <>
                <Separator className="my-1"/>
                <span className="text-base text-muted-foreground">
                    {t("label-storage")}
                </span>
                <ProjectStorageInfo storageId={project.storageId}/>
            </>
        )}

        <Separator className="my-1"/>
        <span className="text-base text-muted-foreground">
            {t("label-access")}
        </span>
        <ProjectAccessEditor projectId={project.id} authorId={project.authorId}/>

        <Separator className="my-1"/>
        <span className="text-base text-muted-foreground">
            {t("label-danger-zone")}
        </span>
        <ProjectDeleteSection project={project}/>
    </div>
}