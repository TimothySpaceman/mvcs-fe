import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import StoragesList from "@/app/[locale]/storages/(components)/storagesList";
import EditorTest from "@/app/[locale]/storages/(components)/editorTest";

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
            <EditorTest
                typeId="0a231658-4559-4aa1-afac-7e28d83c091b"
                // typeId="05ce6950-f350-4f8d-96fa-18fcb33c9cb7"
            />
        </div>
    </div>
}