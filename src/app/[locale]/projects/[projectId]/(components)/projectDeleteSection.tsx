"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Project} from "@/lib/entities/project";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {useModal} from "@/components/modal/modalProvider";
import ConfirmModal from "@/app/[locale]/projects/[projectId]/(components)/confirmModal";
import {useRouter} from "@/i18n/navigation";

type Props = {
    project: Project;
};

export default function ProjectDeleteSection({project}: Props) {
    const t = useTranslations("ProjectPage.settings.delete");
    const router = useRouter();
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

            const resp = await api.fetch(`/projects/${project.id}`, {
                auth: true,
                method: "DELETE",
            });

            if (!resp.ok) {
                toast.error(t("error-internal-server"));
                return;
            }

            toast.success(t("toast-success"));
            router.push("/projects");
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm text-destructive font-medium">{t("label-title")}</span>
                <span className="text-xs text-shadow-destructive">{t("label-description")}</span>
            </div>
            <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
            >
                {isLoading && <Spinner data-icon="inline-start"/>}
                {t("label-button")}
            </Button>
        </div>
    );
}