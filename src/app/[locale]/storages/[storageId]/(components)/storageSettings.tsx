"use client";

import {useTranslations} from "next-intl";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {GearIcon} from "@phosphor-icons/react";
import {useModal} from "@/components/modal/modalProvider";
import StorageAccessEditor from "@/app/[locale]/storages/[storageId]/(components)/storageAccessEditor";
import StorageConfigModal from "@/app/[locale]/storages/[storageId]/(components)/storageConfigModal";

type Props = {
    storageId: string;
}

export default function StorageSettings({storageId}: Props) {
    const t = useTranslations("StoragePage.settings");
    const {addModal} = useModal();

    function openConfigModal() {
        addModal((onClose) => (
            <StorageConfigModal storageId={storageId} onClose={onClose}/>
        ));
    }

    return <div className="flex flex-col gap-1">
        <span className="text-base text-muted-foreground">
            {t("label-config")}
        </span>
        <div className="flex items-center gap-2 py-1">
            <Button variant="secondary" onClick={openConfigModal}>
                <GearIcon data-icon="inline-start"/>
                {t("label-edit-config")}
            </Button>
        </div>

        <Separator className="my-1"/>
        <span className="text-base text-muted-foreground">
            {t("label-access")}
        </span>
        <StorageAccessEditor storageId={storageId}/>
    </div>
}