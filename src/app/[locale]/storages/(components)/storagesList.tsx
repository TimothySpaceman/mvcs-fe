"use client"

import {Spinner} from "@/components/ui/spinner";
import {useEffect, useState} from "react";
import {Storage} from "@/lib/entities/storage";
import {api} from "@/lib/api";
import {useTranslations} from "next-intl";
import StorageCard from "@/app/[locale]/storages/(components)/storageCard";

export default function StoragesList() {
    const t = useTranslations("StoragesPage.list");

    const [isLoading, setIsLoading] = useState(false);
    const [storages, setStorages] = useState<Storage[]>([]);

    useEffect(() => {
        setIsLoading(true);
        api.fetch("/storages", {auth: true})
            .then(resp => resp.json())
            .then(setStorages)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [])

    if (isLoading) return <Spinner className="size-8 mx-auto"/>;
    if (storages.length === 0) {
        return <p className="text-center text-muted-foreground">
            {t("label-no-storages")}
        </p>;
    }

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {storages.map((storage) => <StorageCard
            key={`storage-${storage.id}`}
            storage={storage}
        />)}
    </div>;
}