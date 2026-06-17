"use client";

import {useQueryState, parseAsStringLiteral} from "nuqs";
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
import ProjectFilesView from "@/components/projectFilesView/projectFilesView";
import ProjectHistory from "@/components/projectHistory/projectHistory";
import InitInstructions from "@/app/[locale]/projects/[projectId]/(components)/initInstructions";
import LatestCommitInfo from "@/app/[locale]/projects/[projectId]/(components)/latestCommitInfo";
import MergeRequestsList from "@/app/[locale]/projects/[projectId]/(components)/mergeRequestsList";

const TabNames = ["files", "history", "merges", "tasks", "settings"] as const;
type TabName = typeof TabNames[number];

type Props = {
    projectId: string;
    defaultRefName?: string;
    isInitialized: boolean;
};

export default function ProjectTabs({projectId, defaultRefName, isInitialized}: Props) {
    const t = useTranslations("ProjectPage");

    const [tab, setTab] = useQueryState(
        "tab",
        parseAsStringLiteral(TabNames).withDefault("files")
    );

    return (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabName)}>
            <TabsList variant="line" className="!px-0">
                <TabsTrigger value="files">
                    <FolderOpenIcon/>
                    {t("tabs.label-files")}
                </TabsTrigger>
                <TabsTrigger value="history" disabled={!isInitialized}>
                    <ClockCounterClockwiseIcon/>
                    {t("tabs.label-history")}
                </TabsTrigger>
                <TabsTrigger value="merges">
                    <GitPullRequestIcon/>
                    {t("tabs.label-merges")}
                </TabsTrigger>
                <TabsTrigger value="tasks" disabled>
                    <CheckCircleIcon/>
                    {t("tabs.label-tasks")}
                </TabsTrigger>
                <TabsTrigger value="settings" disabled>
                    <GearIcon/>
                    {t("tabs.label-settings")}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="flex flex-col gap-1">
                {!isInitialized
                    ? <InitInstructions projectId={projectId}/>
                    : <>
                        <div className="flex gap-1 items-center">
                            <RefSelector
                                className="!h-full"
                                projectId={projectId}
                                defaultRef={defaultRefName}
                            />
                            <LatestCommitInfo projectId={projectId} className="p-0.5 pr-1.5 "/>
                        </div>
                        <ProjectFilesView projectId={projectId}/>
                    </>
                }
            </TabsContent>
            <TabsContent value="history">
                <RefSelector
                    projectId={projectId}
                    defaultRef={defaultRefName}
                    allowCommit={false}
                />
                <ProjectHistory projectId={projectId}/>
            </TabsContent>
            <TabsContent value="merges">
                <MergeRequestsList projectId={projectId}/>
            </TabsContent>
            <TabsContent value="tasks"/>
            <TabsContent value="settings"/>
        </Tabs>
    );
}