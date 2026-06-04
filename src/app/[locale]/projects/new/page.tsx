import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Container from "@/components/container/container";
import NewProjectForm from "@/app/[locale]/projects/new/(components)/newProjectForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("NewProjectPage.meta");

    return {
        title: t("title"),
        description: t("description")
    };
}

export default async function Page() {
    const t = await getTranslations("NewProjectPage");

    return <Container className="space-y-4 max-w-3xl">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <NewProjectForm/>
    </Container>
}