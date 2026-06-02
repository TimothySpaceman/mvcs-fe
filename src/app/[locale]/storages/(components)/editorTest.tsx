"use client"

import {useEffect, useState} from "react";
import {StorageType} from "@/lib/entities/storage";
import {api} from "@/lib/api";
import {Spinner} from "@/components/ui/spinner";
import StorageConfigEditor from "@/components/storageConfigEditor/storageConfigEditor";

type Props = {
    typeId: string
}

export default function EditorTest({typeId}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [storageType, setStorageType] = useState<StorageType>();

    useEffect(() => {
        setIsLoading(true);
        api.fetch(`/storage-types/${typeId}`, {auth: true})
            .then(resp => resp.json())
            .then(setStorageType)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [])

    if (isLoading) return <Spinner className="size-8 mx-auto my-4"/>;
    if (!storageType) return <>Empty storage type!</>

    return <StorageConfigEditor schemaFields={storageType.configSchema.fields} isLoading={isLoading}/>
}