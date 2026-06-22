"use client"

import {Spinner} from "@/components/ui/spinner";
import {Storage} from "@/lib/entities/storage";
import {useTranslations} from "next-intl";
import StorageCard from "@/app/[locale]/storages/(components)/storageCard";
import useSWR from "swr";

export default function StoragesList() {
    const t = useTranslations("StoragesPage.list");

    const {data: storages, isLoading, error} = useSWR<Storage[]>("/storages");

    if (isLoading) return <Spinner className="size-8 mx-auto"/>;

    if (!!error || !storages) {
        return <p className="text-center text-destructive">
            {t("error-failed")}
        </p>;
    }

    if (storages.length === 0) {
        return <p className="text-center text-muted-foreground">
            {t("label-no-storages")}
        </p>;
    }

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {storages?.map((storage) => <StorageCard
            key={`storage-${storage.id}`}
            storage={storage}
        />)}
    </div>;
}