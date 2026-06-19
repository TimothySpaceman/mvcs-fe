"use client";

import {useCallback, useRef} from "react";
import {useTranslations} from "next-intl";
import {useModal} from "@/components/modal/modalProvider";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "@phosphor-icons/react";
import {hasAccess, ProjectAccessLevel} from "@/lib/entities/project";
import ReleasesList from "@/app/[locale]/projects/[projectId]/(components)/releasesList";
import ReleaseModal from "@/app/[locale]/projects/[projectId]/(components)/releaseModal";

type Props = {
    projectId: string;
    accessLevel: ProjectAccessLevel | null;
};

export default function ReleasesTab({projectId, accessLevel}: Props) {
    const t = useTranslations("ProjectPage.releases");
    const {addModal} = useModal();

    const canWrite = hasAccess(accessLevel, "write");

    const refreshRef = useRef<() => void>(() => {});
    const handleMutateReady = useCallback((mutate: () => void) => {
        refreshRef.current = mutate;
    }, []);

    function handleNewRelease() {
        if (!canWrite) return;
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
            {canWrite && <div className="flex justify-end">
                <Button onClick={handleNewRelease}>
                    <PlusIcon data-icon="inline-start"/>
                    {t("label-new")}
                </Button>
            </div>}
            <ReleasesList
                projectId={projectId}
                accessLevel={accessLevel}
                onMutateReady={handleMutateReady}
            />
        </div>
    );
}