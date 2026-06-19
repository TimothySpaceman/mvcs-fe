import Container from "@/components/container/container";
import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import SettingsTabs from "@/app/[locale]/settings/(components)/settingsTabs";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("SettingsPage.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const t = await getTranslations("SettingsPage");

    return (
        <div className="flex flex-col flex-1">
            <Container className="max-w-3xl">
                <h1 className="font-bold text-2xl">{t("title")}</h1>
            </Container>
            <SettingsTabs/>
        </div>
    );
}