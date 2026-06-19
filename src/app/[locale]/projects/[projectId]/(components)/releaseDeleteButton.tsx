"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {TrashIcon} from "@phosphor-icons/react";
import {useModal} from "@/components/modal/modalProvider";
import ConfirmModal from "@/components/confirmModal/confirmModal";

type Props = {
    projectId: string;
    releaseId: string;
    onDeleted?: () => void;
};

export default function ReleaseDeleteButton({projectId, releaseId, onDeleted}: Props) {
    const t = useTranslations("ProjectPage.releases.delete");
    const {addModal} = useModal();
    const [isLoading, setIsLoading] = useState(false);

    function handleDelete() {
        addModal((onClose) => (
            <ConfirmModal
                title={t("confirm-title")}
                description={t("confirm-description")}
                labelConfirm={t("confirm-label-confirm")}
                labelCancel={t("confirm-label-cancel")}
                onConfirm={async () => {
                    onClose();
                    await performDelete();
                }}
                onClose={onClose}
            />
        ));
    }

    async function performDelete() {
        try {
            setIsLoading(true);

            const resp = await api.fetch(`/projects/${projectId}/releases/${releaseId}`, {
                auth: true,
                method: "DELETE",
            });

            if (resp.ok) {
                toast.success(t("toast-success"));
                onDeleted?.();
                return;
            }

            if (resp.status === 403) {
                toast.error(t("error-forbidden"));
                return;
            }

            toast.error(t("error-internal-server"));
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant="destructive"
            size="icon-sm"
            onClick={handleDelete}
            disabled={isLoading}
            title={t("label-button")}
        >
            {isLoading
                ? <Spinner className="size-3.5"/>
                : <TrashIcon className="size-3.5"/>
            }
        </Button>
    );
}