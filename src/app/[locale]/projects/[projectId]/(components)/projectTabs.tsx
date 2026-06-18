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
import Container from "@/components/container/container";
import {Separator} from "@/components/ui/separator";

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
            <Container className="max-w-3xl" rootClassName="!p-0">
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
            </Container>

            <Separator className="!m-0"/>

            <TabsContent value="files">
                <Container className="max-w-3xl flex flex-col gap-1" rootClassName="!p-0">
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
                </Container>
            </TabsContent>

            <TabsContent value="history">
                <Container className="max-w-3xl" rootClassName="!p-0">
                    <RefSelector
                        projectId={project.id}
                        defaultRef={project.defaultRefName}
                        allowCommit={false}
                    />
                    <ProjectHistory projectId={project.id}/>
                </Container>
            </TabsContent>

            {canRead && (
                <TabsContent value="merges">
                    <Container className="max-w-3xl flex flex-col gap-2 items-center" rootClassName="!p-0">
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
                    </Container>
                </TabsContent>
            )}

            {canRead && (
                <TabsContent value="tasks">
                    <Container className="max-w-4xl" rootClassName="!p-0">
                        <TasksTab projectId={project.id} readonly={!canWrite}/>
                    </Container>
                </TabsContent>
            )}

            {hasAccess(project.accessLevel, "owner") && (
                <TabsContent value="settings">
                    <Container className="max-w-3xl" rootClassName="!p-0">
                        <SettingsTab project={project}/>
                    </Container>
                </TabsContent>
            )}
        </Tabs>
    );
}