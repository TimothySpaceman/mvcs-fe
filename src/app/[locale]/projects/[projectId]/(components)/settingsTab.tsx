import {Project} from "@/lib/entities/project";
import ProjectStorageInfo from "@/app/[locale]/projects/[projectId]/(components)/projectStorageInfo";
import {Separator} from "@/components/ui/separator";
import ProjectEditForm from "@/app/[locale]/projects/[projectId]/(components)/projectEditForm";
import {useTranslations} from "next-intl";

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
    </div>
}