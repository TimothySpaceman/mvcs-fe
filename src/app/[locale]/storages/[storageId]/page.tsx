import {getServerApi} from "@/lib/api";
import {notFound} from "next/navigation";
import {Storage} from "@/lib/entities/storage";
import Container from "@/components/container/container";
import {cache} from "react";
import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import StorageInfo from "@/app/[locale]/storages/[storageId]/(components)/storageInfo";
import StorageHealthBadge from "@/app/[locale]/storages/[storageId]/(components)/storageHealthBadge";

const getStorage = cache(async (storageId: string) => {
    const api = await getServerApi();
    const resp = await api.fetch(`/storages/${storageId}`, {auth: true});
    if (resp.status === 404) notFound();
    if (!resp.ok) throw new Error("Failed to fetch storage");
    return await resp.json() as Storage;
})

type Props = {
    params: Promise<{ storageId: string }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {storageId} = await params;
    const storage = await getStorage(storageId);

    const t = await getTranslations("Storage.meta");

    return {
        title: t("title", {storageName: storage.name}),
        description: t("description", {storageName: storage.name}),
    };
}

export default async function Page({params}: Props) {
    const {storageId} = await params;
    const storage = await getStorage(storageId);

    return <Container className="space-y-4 max-w-3xl">
        <div className="flex gap-2 items-start justify-between">
            <StorageInfo storage={storage}/>
            <StorageHealthBadge storageId={storage.id}/>
        </div>

        {/*{JSON.stringify(storage, null, 2)}*/}
    </Container>
}