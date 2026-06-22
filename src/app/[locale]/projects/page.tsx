import Container from "@/components/container/container";
import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import ProjectsSearchBar from "@/app/[locale]/projects/(components)/projectsSearchBar";
import ProjectsList from "@/components/projects/projectsList";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("ProjectsPage.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const t = await getTranslations("ProjectsPage");

    return (
        <Container className="space-y-4 max-w-3xl">
            <h1 className="font-bold text-2xl">{t("title")}</h1>
            <ProjectsSearchBar/>
            <ProjectsList/>
        </Container>
    );
}