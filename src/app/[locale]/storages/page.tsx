import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import StoragesList from "@/app/[locale]/storages/(components)/storagesList";
import StorageSearchBar from "@/app/[locale]/storages/(components)/storageSearchBar";
import Container from "@/components/container/container";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Storages.meta");

    return {
        title: t("title"),
        description: t("description")
    };
}

export default async function Page() {
    const t = await getTranslations("Storages");

    return <Container className="space-y-4">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <StorageSearchBar/>
        <StoragesList/>
    </Container>
}