import {getServerApi} from "@/lib/api";
import {notFound} from "next/navigation";
import Container from "@/components/container/container";
import {cache} from "react";
import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {Project} from "@/lib/entities/project";
import {User} from "@/lib/auth/types";
import ProjectInfo from "@/app/[locale]/projects/[projectId]/(components)/projectInfo";
import ProjectTabs from "@/app/[locale]/projects/[projectId]/(components)/projectTabs";

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

    return <div className="space-y-4">
        <Container className="space-y-4 max-w-3xl" rootClassName="!pb-0 mb-0">
            <ProjectInfo project={project} author={author} className="!mb-2"/>
        </Container>
        <ProjectTabs project={project}/>
    </div>
}