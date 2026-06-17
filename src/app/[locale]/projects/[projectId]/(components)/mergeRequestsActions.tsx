"use client";

import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "@phosphor-icons/react";
import {useModal} from "@/components/modal/modalProvider";
import MergeRequestModal from "@/app/[locale]/projects/[projectId]/(components)/mergeRequestModal";

type Props = {
    projectId: string;
    onSuccess?: () => void;
    className?: string;
};

export default function MergeRequestsActions({projectId, onSuccess = () => {}, className}: Props) {
    const t = useTranslations("ProjectPage.merges");
    const {addModal} = useModal();

    function handleOpenModal() {
        addModal((onClose) => (
            <MergeRequestModal
                projectId={projectId}
                onClose={onClose}
                onSuccess={onSuccess}
            />
        ), {closeOnBlur: false});
    }

    return (
        <Button onClick={handleOpenModal} className={className}>
            <PlusIcon data-icon="inline-start"/>
            {t("label-new")}
        </Button>
    );
}