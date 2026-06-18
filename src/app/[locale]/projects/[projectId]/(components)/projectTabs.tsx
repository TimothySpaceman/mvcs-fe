"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    CheckCircleIcon,
    ClockCounterClockwiseIcon,
    FolderOpenIcon,
    GearIcon,
    GitPullRequestIcon
} from "@phosphor-icons/react";
import {useTranslations} from "next-intl";
import RefSelector from "@/app/[locale]/projects/[projectId]/(components)/refSelector";
import ProjectHistory from "@/components/projectHistory/projectHistory";
import InitInstructions from "@/app/[locale]/projects/[projectId]/(components)/initInstructions";
import LatestCommitInfo from "@/app/[locale]/projects/[projectId]/(components)/latestCommitInfo";
import MergeRequestsList from "@/app/[locale]/projects/[projectId]/(components)/mergeRequestsList";
import MergeRequestsActions from "@/app/[locale]/projects/[projectId]/(components)/mergeRequestsActions";
import {useSWRConfig} from "swr";
import FilesAndMetadata from "@/app/[locale]/projects/[projectId]/(components)/filesAndMetadata";
import TasksTab from "@/app/[locale]/projects/[projectId]/(components)/tasksTab";
import {hasAccess, Project} from "@/lib/entities/project";
import SettingsTab from "@/app/[locale]/projects/[projectId]/(components)/settingsTab";
import {useQueryState, parseAsStringLiteral} from "nuqs";
import {useEffect, useMemo} from "react";

const TabNames = ["files", "history", "merges", "tasks", "settings"] as const;
type TabName = typeof TabNames[number];

type Props = {
    project: Project;
};

export default function ProjectTabs({project}: Props) {
    const t = useTranslations("ProjectPage");
    const {mutate} = useSWRConfig();

    const allowedTabs = useMemo((): readonly TabName[] => {
        const level = project.accessLevel;
        const tabs: TabName[] = ["files", "history"];
        if (hasAccess(level, "read")) tabs.push("merges", "tasks");
        if (hasAccess(level, "owner")) tabs.push("settings");
        return tabs;
    }, [project.accessLevel]);

    const [tab, setTab] = useQueryState(
        "tab",
        parseAsStringLiteral(TabNames).withDefault("files")
    );

    useEffect(() => {
        if (!allowedTabs.includes(tab)) setTab("files");
    }, [tab, allowedTabs, setTab]);

    const activeTab = allowedTabs.includes(tab) ? tab : "files";

    const canWrite = hasAccess(project.accessLevel, "write");
    const canRead = hasAccess(project.accessLevel, "read");

    return (
        <Tabs value={activeTab} onValueChange={(v) => setTab(v as TabName)}>
            <TabsList variant="line" className="!px-0">
                <TabsTrigger value="files">
                    <FolderOpenIcon/>
                    {t("tabs.label-files")}
                </TabsTrigger>
                <TabsTrigger value="history" disabled={!project.isInitialized}>
                    <ClockCounterClockwiseIcon/>
                    {t("tabs.label-history")}
                </TabsTrigger>
                {canRead && (
                    <TabsTrigger value="merges" disabled={!project.isInitialized}>
                        <GitPullRequestIcon/>
                        {t("tabs.label-merges")}
                    </TabsTrigger>
                )}
                {canRead && (
                    <TabsTrigger value="tasks">
                        <CheckCircleIcon/>
                        {t("tabs.label-tasks")}
                    </TabsTrigger>
                )}
                {hasAccess(project.accessLevel, "owner") && (
                    <TabsTrigger value="settings">
                        <GearIcon/>
                        {t("tabs.label-settings")}
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="files" className="flex flex-col gap-1">
                {!project.isInitialized
                    ? <InitInstructions projectId={project.id}/>
                    : <>
                        <div className="flex gap-1 items-center">
                            <RefSelector
                                className="!h-full"
                                projectId={project.id}
                                defaultRef={project.defaultRefName}
                            />
                            <LatestCommitInfo projectId={project.id} className="p-0.5 pr-1.5"/>
                        </div>
                        <FilesAndMetadata projectId={project.id}/>
                    </>
                }
            </TabsContent>

            <TabsContent value="history">
                <RefSelector
                    projectId={project.id}
                    defaultRef={project.defaultRefName}
                    allowCommit={false}
                />
                <ProjectHistory projectId={project.id}/>
            </TabsContent>

            {canRead && (
                <TabsContent value="merges" className="flex flex-col gap-2 items-center">
                    {canWrite && (
                        <MergeRequestsActions
                            className="self-end!"
                            projectId={project.id}
                            onSuccess={() => mutate(
                                (key) => typeof key === "string" && key.startsWith(`/projects/${project.id}/vcs/merge-requests`),
                                undefined,
                                {revalidate: true}
                            )}
                        />
                    )}
                    <MergeRequestsList className="w-full" projectId={project.id}/>
                </TabsContent>
            )}

            {canRead && (
                <TabsContent value="tasks">
                    <TasksTab projectId={project.id} readonly={!canWrite}/>
                </TabsContent>
            )}

            {hasAccess(project.accessLevel, "owner") && (
                <TabsContent value="settings">
                    <SettingsTab project={project}/>
                </TabsContent>
            )}
        </Tabs>
    );
}