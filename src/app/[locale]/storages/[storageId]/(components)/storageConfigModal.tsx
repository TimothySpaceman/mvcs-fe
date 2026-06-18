import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import useSWR, {useSWRConfig} from "swr";
import {useEffect, useState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {WarningCircleIcon} from "@phosphor-icons/react";
import {FieldValue, StorageConfig} from "@/lib/entities/storage";
import StorageConfigEditor from "@/components/storageConfigEditor/storageConfigEditor";
import {toast} from "sonner";
import {api} from "@/lib/api";

type Props = {
    storageId: string
    onClose: () => void
}

export default function StorageConfigModal({storageId, onClose}: Props) {
    const t = useTranslations("StoragePage.configModal");
    const {mutate} = useSWRConfig();

    const {data: config, isLoading, error} = useSWR<StorageConfig>(`/storages/${storageId}/config`);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [values, setValues] = useState<Record<string, FieldValue>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        if (config) setValues(config.config);
    }, [config]);

    async function handleSubmit() {
        setIsSaving(true);
        try {
            const resp = await api.fetch(`/storages/${storageId}/config`, {
                auth: true,
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({config: JSON.stringify(values)}),
            });

            if (!resp.ok) {
                toast.error(t("error-failed"));
                return;
            }

            mutate(`/storages/${storageId}/config`);
            toast.success(t("toast-success"));
            onClose();
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsSaving(false);
        }
    }

    return <div className="space-y-4 w-100 max-w-full">
        <h2 className="font-bold text-xl">{t("title")}</h2>

        {isLoading ? (
            <Spinner className="mx-auto size-8"/>
        ) : error || !config ? (
            <div className="flex items-center gap-2 text-destructive">
                <WarningCircleIcon className="size-6"/>
                <span>{t("error-load")}</span>
            </div>
        ) : (
            <>
                <StorageConfigEditor
                    schemaFields={config.type.configSchema.fields}
                    values={values}
                    onChange={setValues}
                    errors={errors}
                    isLoading={isSaving}
                />
                <div className="flex gap-2 justify-end">
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Spinner data-icon="inline-start"/>}
                        {t("label-save")}
                    </Button>
                    <Button onClick={onClose} variant="secondary" disabled={isSaving}>
                        {t("label-cancel")}
                    </Button>
                </div>
            </>
        )}
    </div>
}