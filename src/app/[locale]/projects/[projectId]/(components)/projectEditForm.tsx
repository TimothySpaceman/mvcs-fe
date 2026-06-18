"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import useSWR from "swr";
import {toast} from "sonner";
import {Project, Ref} from "@/lib/entities/project";
import {api} from "@/lib/api";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useModal} from "@/components/modal/modalProvider";
import ConfirmModal from "./confirmModal";
import {useRouter} from "@/i18n/navigation";

type Props = {
    project: Project;
};

type FormState = {
    title: string;
    description: string;
    isPublic: boolean;
    defaultRefName: string | null;
};

type Errors = {
    title?: string;
};

export default function ProjectEditForm({project}: Props) {
    const t = useTranslations("ProjectPage.settings.form");
    const router = useRouter();
    const {addModal} = useModal();

    const {data: refs, isLoading: isRefsLoading} = useSWR<Ref[]>(`/projects/${project.id}/vcs/refs`);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const [baseline, setBaseline] = useState<FormState>({
        title: project.title,
        description: project.description ?? "",
        isPublic: project.isPublic,
        defaultRefName: project.defaultRefName ?? null,
    });
    const [form, setForm] = useState<FormState>(baseline);

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => ({...prev, [key]: value}));
        setErrors(prev => ({...prev, [key]: undefined}));
    }

    function validate(): boolean {
        const newErrors: Errors = {};
        if (!form.title.trim()) newErrors.title = "error-title-required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function submitUpdate() {
        try {
            setIsLoading(true);
            const resp = await api.fetch(`/projects/${project.id}`, {
                auth: true,
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    isPublic: form.isPublic,
                    defaultRefName: form.defaultRefName,
                }),
            });

            if (resp.ok) {
                toast.success(t("toast-success"));
                router.refresh();
                setBaseline({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    isPublic: form.isPublic,
                    defaultRefName: form.defaultRefName,
                });
                return true;
            }

            toast.error(t("error-internal-server"));
            return false;
        } catch {
            toast.error(t("error-internal-server"));
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit() {
        if (!validate()) return;

        const isPublicChanged = form.isPublic !== baseline.isPublic;
        const defaultRefChanged = form.defaultRefName !== baseline.defaultRefName;

        if (isPublicChanged || defaultRefChanged) {
            const warnings: string[] = [];
            if (isPublicChanged) warnings.push(t(form.isPublic ? "confirm-make-public" : "confirm-make-private"));
            if (defaultRefChanged) warnings.push(t("confirm-default-branch"));

            addModal((onClose) => (
                <ConfirmModal
                    title={t("confirm-title")}
                    description={warnings.join(" ")}
                    labelConfirm={t("confirm-label-confirm")}
                    labelCancel={t("confirm-label-cancel")}
                    onConfirm={async () => {
                        onClose();
                        await submitUpdate();
                    }}
                    onClose={onClose}
                />
            ));
            return;
        }

        await submitUpdate();
    }

    const isDirty =
        form.title.trim() !== baseline.title ||
        form.description.trim() !== baseline.description ||
        form.isPublic !== baseline.isPublic ||
        form.defaultRefName !== baseline.defaultRefName;

    return (
        <div className="space-y-4">
            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="settings-title-input">
                        {t("label-title")}
                    </FieldLabel>
                    <Input
                        id="settings-title-input"
                        type="text"
                        value={form.title}
                        onChange={e => setField("title", e.target.value)}
                        disabled={isLoading}
                        aria-invalid={!!errors.title}
                    />
                    {errors.title && (
                        <FieldError className="text-destructive">{t(errors.title)}</FieldError>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="settings-description-input">
                        {t("label-description")}
                    </FieldLabel>
                    <Textarea
                        id="settings-description-input"
                        value={form.description}
                        onChange={e => setField("description", e.target.value)}
                        disabled={isLoading}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="settings-default-branch-select">
                        {t("label-default-branch")}
                        {isRefsLoading && <Spinner data-icon="inline-end"/>}
                    </FieldLabel>
                    <Select
                        value={form.defaultRefName ?? undefined}
                        onValueChange={v => setField("defaultRefName", v)}
                        disabled={isLoading || isRefsLoading || !refs?.length}
                    >
                        <SelectTrigger id="settings-default-branch-select">
                            <SelectValue placeholder={t("placeholder-default-branch")}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {refs?.map(ref => (
                                    <SelectItem key={ref.name} value={ref.name}>
                                        {ref.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <Field>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="settings-is-public-checkbox"
                            checked={form.isPublic}
                            onCheckedChange={v => setField("isPublic", !!v)}
                            disabled={isLoading}
                        />
                        <FieldLabel htmlFor="settings-is-public-checkbox" className="cursor-pointer">
                            {t("label-is-public")}
                        </FieldLabel>
                    </div>
                </Field>
            </FieldGroup>

            <Button
                onClick={handleSubmit}
                disabled={!isDirty || isLoading || !form.title.trim()}
            >
                {isLoading && <Spinner data-icon="inline-start"/>}
                {t("label-submit")}
            </Button>
        </div>
    );
}