import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import useSWR from "swr";
import {Select, SelectTrigger, SelectContent, SelectValue, SelectItem, SelectGroup} from "@/components/ui/select";
import {useMemo, useState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {Field, FieldLabel, FieldDescription} from "@/components/ui/field";
import {Storage, StorageType, StorageTypeInfo} from "@/lib/entities/storage";
import StorageConfigEditor from "@/components/storageConfigEditor/storageConfigEditor";
import {FieldValue} from "@/lib/entities/storage";
import {api} from "@/lib/api";
import {useRouter} from "@/i18n/navigation";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";

type Props = {
    onClose: () => void
}

export default function AddStorageModal({onClose}: Props) {
    const t = useTranslations("StoragesPage.addModal");
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [typeId, setTypeId] = useState<string>();
    const [configValues, setConfigValues] = useState<Record<string, FieldValue>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    const {data: types, isLoading: isLoadingTypes, error: errorTypes} = useSWR<StorageTypeInfo[]>("/storage-types");
    const {
        data: storageType,
        isLoading: isLoadingType,
        error: errorType
    } = useSWR<StorageType>(typeId ? `/storage-types/${typeId}` : null);

    const typeInfo = useMemo(
        () => typeId ? types?.find(t => t.id === typeId) : undefined,
        [typeId, types]
    );

    async function handleSubmit() {
        setIsLoading(true);
        try {
            const resp = await api.fetch("/storages", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: name,
                    storageTypeId: typeId,
                    config: JSON.stringify(configValues),
                })
            });

            if (!resp.ok) {
                toast.error(t("error-failed"));
                return;
            }

            const body = await resp.json() as Storage;
            router.push(`/storages/${body.id}`);
            onClose();
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    const canSubmit = !!typeId && Object.values(configValues).length > 0 && name.trim().length > 0;

    return <div className="space-y-4">
        <h2 className="font-bold text-xl">{t("title")}</h2>
        <Field>
            <FieldLabel htmlFor="storage-name-input">
                {t("label-name")}
            </FieldLabel>
            <Input
                id="storage-name-input"
                type="text"
                name="storage-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isLoading}
            />
            <FieldDescription>
                {t("description-name")}
            </FieldDescription>
        </Field>
        <Field>
            <FieldLabel>
                {t("label-storage-type")}
                {isLoadingTypes && <Spinner data-icon="inline-end"/>}
            </FieldLabel>
            <Select
                name="storage-type"
                value={typeId}
                onValueChange={setTypeId}
                disabled={isLoadingTypes || !!errorTypes}
            >
                <SelectTrigger>
                    <SelectValue placeholder={t("placeholder-storage-type")}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {types?.map((type) => <SelectItem
                            key={`storage-type-${type.id}`}
                            value={type.id}
                        >
                            {type.label}
                        </SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {typeId && typeInfo && <FieldDescription>
                {typeInfo.description}
            </FieldDescription>}
        </Field>

        {isLoadingType ? <Spinner className="mx-auto size-8"/> : (
            storageType
                ? <StorageConfigEditor
                    schemaFields={storageType.configSchema.fields}
                    values={configValues}
                    onChange={setConfigValues}
                    errors={errors}
                    isLoading={isLoading}
                />
                : <p className="text-muted-foreground">{t("message-select-type")}</p>
        )}

        <div className="flex gap-2 justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                {isLoading && <Spinner data-icon="inline-start"/>}
                {t("label-add")}
            </Button>
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>
                {t("label-cancel")}
            </Button>
        </div>
    </div>
}