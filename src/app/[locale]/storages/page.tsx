import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import StoragesList from "@/app/[locale]/storages/(components)/storagesList";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Storages.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const t = await getTranslations("Storages");

    return <div className="py-4">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-center font-bold text-2xl">{t("title")}</h1>
            <StoragesList/>
        </div>
    </div>
}