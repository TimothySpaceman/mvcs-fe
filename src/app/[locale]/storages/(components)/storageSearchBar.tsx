"use client";

import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {PlusIcon} from "@phosphor-icons/react";
import {useModal} from "@/components/modal/modalProvider";
import AddStorageModal from "@/app/[locale]/storages/(components)/addStorageModal";

export default function StorageSearchBar() {
    const t = useTranslations("Storages.bar");
    const {addModal} = useModal();

    function handleAdd() {
        addModal(
            (onClose) => <AddStorageModal onClose={onClose}/>,
            {closeOnBlur: false, modalClassName: "max-w-100 w-full"}
        );
    }

    return <div className="flex gap-2">
        <Input placeholder="NOT IMPLEMENTED" disabled/>
        <Button onClick={handleAdd}>
            <PlusIcon data-icon="inline-start"/>
            {t("label-add")}
        </Button>
    </div>
}