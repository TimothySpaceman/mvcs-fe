"use client";

import {useCallback, useRef} from "react";
import {useTranslations} from "next-intl";
import {useModal} from "@/components/modal/modalProvider";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "@phosphor-icons/react";
import ReleasesList from "@/app/[locale]/projects/[projectId]/(components)/releasesList";
import ReleaseModal from "@/app/[locale]/projects/[projectId]/(components)/releaseModal";

type Props = {
    projectId: string;
    readonly?: boolean;
};

export default function ReleasesTab({projectId, readonly}: Props) {
    const t = useTranslations("ProjectPage.releases");
    const {addModal} = useModal();

    const refreshRef = useRef<() => void>(() => {});
    const handleMutateReady = useCallback((mutate: () => void) => {
        refreshRef.current = mutate;
    }, []);

    function handleNewRelease() {
        if (readonly) return;
        addModal((onClose) => (
            <ReleaseModal
                projectId={projectId}
                onClose={onClose}
                onSuccess={() => refreshRef.current()}
            />
        ), {closeOnBlur: false});
    }

    return (
        <div className="flex flex-col gap-2">
            {!readonly && <div className="flex justify-end">
                <Button onClick={handleNewRelease}>
                    <PlusIcon data-icon="inline-start"/>
                    {t("label-new")}
                </Button>
            </div>}
            <ReleasesList projectId={projectId} onMutateReady={handleMutateReady}/>
        </div>
    );
}