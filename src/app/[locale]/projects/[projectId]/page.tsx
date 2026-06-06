import {getServerApi} from "@/lib/api";
import {notFound} from "next/navigation";
import Container from "@/components/container/container";
import {cache} from "react";
import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {Project} from "@/lib/entities/project";
import {User} from "@/lib/auth/types";
import ProjectInfo from "@/app/[locale]/projects/[projectId]/(components)/projectInfo";
import InitInstructions from "@/app/[locale]/projects/[projectId]/(components)/initInstructions";
import {Separator} from "@/components/ui/separator";
import ProjectFilesView from "@/components/projectFilesView/projectFilesView";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ClockCounterClockwiseIcon, FolderOpenIcon, GearIcon} from "@phosphor-icons/react/dist/ssr";
import RefSelector from "@/app/[locale]/projects/[projectId]/(components)/refSelector";
import ProjectHistory from "@/components/projectHistory/projectHistory";

const getProject = cache(async (projectId: string) => {
    const api = await getServerApi();

    const resp = await api.fetch(`/projects/${projectId}`, {auth: true});
    if (resp.status === 404) notFound();
    if (!resp.ok) throw new Error("Failed to fetch project");

    const result: {
        project: Project;
        author?: User
    } = {
        project: await resp.json() as Project
    }

    const authorResp = await api.fetch(`/users/${result.project.authorId}`, {auth: true});
    if (authorResp.ok) result.author = await authorResp.json() as User;

    return result;
})

type Props = {
    params: Promise<{ projectId: string }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {projectId} = await params;
    const {project, author} = await getProject(projectId);

    const t = await getTranslations("ProjectPage.meta");

    const values = {
        projectName: project.title,
        authorName: author ? author.displayName : t("author-fallback"),
    }

    return {
        title: t("title", values),
        description: t("description", values),
    };
}

export default async function Page({params}: Props) {
    const {projectId} = await params;
    const {project, author} = await getProject(projectId);

    const t = await getTranslations("ProjectPage");

    return <Container className="space-y-4 max-w-3xl">
        <ProjectInfo project={project} author={author} className="!mb-2"/>
        <Separator className="!m-0"/>

        <Tabs defaultValue="files">
            <TabsList variant="line" className="!px-0">
                <TabsTrigger value="files">
                    <FolderOpenIcon/>
                    {t("tabs.label-files")}
                </TabsTrigger>
                <TabsTrigger value="history" disabled={!project.isInitialized}>
                    <ClockCounterClockwiseIcon/>
                    {t("tabs.label-history")}
                </TabsTrigger>
                <TabsTrigger value="settings" disabled>
                    <GearIcon/>
                    {t("tabs.label-settings")}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="files" className="flex flex-col gap-1">
                {!project.isInitialized
                    ? <InitInstructions projectId={project.id}/>
                    : <>
                        <RefSelector
                            className="!p-1 !h-6"
                            projectId={project.id}
                            defaultRef={project.defaultRefName}
                        />
                        <ProjectFilesView projectId={project.id}/>
                    </>
                }
            </TabsContent>
            <TabsContent value="history">
                <RefSelector
                    className="!p-1 !h-6"
                    projectId={project.id}
                    defaultRef={project.defaultRefName}
                    allowCommit={false}
                />
                <ProjectHistory projectId={project.id}/>
            </TabsContent>
        </Tabs>
    </Container>
}