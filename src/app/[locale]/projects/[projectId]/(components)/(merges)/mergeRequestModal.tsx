"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";
import useSWR from "swr";
import {Ref} from "@/lib/entities/project";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

type Props = {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
};

type FormState = {
    title: string;
    sourceRefName: string | null;
    targetRefName: string | null;
};

type Errors = {
    title?: string;
    sourceRefName?: string;
    targetRefName?: string;
};

export default function MergeRequestModal({projectId, onClose, onSuccess}: Props) {
    const t = useTranslations("ProjectPage.merges.createModal");

    const {data: refs, isLoading: isRefsLoading} = useSWR<Ref[]>(`/projects/${projectId}/vcs/refs`);

    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormState>({
        title: "",
        sourceRefName: null,
        targetRefName: null,
    });
    const [errors, setErrors] = useState<Errors>({});

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => ({...prev, [key]: value}));
        setErrors(prev => ({...prev, [key]: undefined}));
    }

    function validate(): boolean {
        const newErrors: Errors = {};
        if (!form.title.trim()) newErrors.title = "error-title-required";
        if (!form.sourceRefName) newErrors.sourceRefName = "error-source-required";
        if (!form.targetRefName) newErrors.targetRefName = "error-target-required";
        if (form.sourceRefName && form.targetRefName && form.sourceRefName === form.targetRefName) {
            newErrors.targetRefName = "error-same-branch";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;

        const sourceRef = refs?.find(r => r.name === form.sourceRefName);
        const targetRef = refs?.find(r => r.name === form.targetRefName);

        if (!sourceRef?.commitId || !targetRef?.commitId) {
            setErrors({sourceRefName: "error-empty-branch"});
            return;
        }

        try {
            setIsLoading(true);

            const resp = await api.fetch(`/projects/${projectId}/vcs/merge-requests`, {
                auth: true,
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: form.title.trim(),
                    sourceRefName: form.sourceRefName,
                    targetRefName: form.targetRefName,
                    expectedSourceHead: sourceRef.commitId,
                    expectedTargetHead: targetRef.commitId,
                }),
            });

            if (resp.ok) {
                toast.success(t("toast-success"));
                onSuccess();
                onClose();
                return;
            }

            if (resp.status === 409) {
                toast.error(t("error-ref-mismatch"));
                return;
            }

            if (resp.status === 422) {
                setErrors({sourceRefName: "error-empty-branch"});
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

    const refsDisabled = isLoading || isRefsLoading;
    const canSubmit = !!form.title.trim() && !!form.sourceRefName && !!form.targetRefName;

    return (
        <div className="space-y-4 w-80">
            <h2 className="font-bold text-xl">{t("title")}</h2>

            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="mr-title-input">
                        {t("label-title")}
                    </FieldLabel>
                    <Input
                        id="mr-title-input"
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

                <Field data-invalid={!!errors.sourceRefName}>
                    <FieldLabel>
                        {t("label-source")}
                        {isRefsLoading && <Spinner data-icon="inline-end"/>}
                    </FieldLabel>
                    <Select
                        value={form.sourceRefName ?? undefined}
                        onValueChange={v => setField("sourceRefName", v)}
                        disabled={refsDisabled}
                    >
                        <SelectTrigger aria-invalid={!!errors.sourceRefName}>
                            <SelectValue placeholder={t("placeholder-branch")}/>
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
                    {errors.sourceRefName && (
                        <FieldError className="text-destructive">{t(errors.sourceRefName)}</FieldError>
                    )}
                </Field>

                <Field data-invalid={!!errors.targetRefName}>
                    <FieldLabel>
                        {t("label-target")}
                    </FieldLabel>
                    <Select
                        value={form.targetRefName ?? undefined}
                        onValueChange={v => setField("targetRefName", v)}
                        disabled={refsDisabled}
                    >
                        <SelectTrigger aria-invalid={!!errors.targetRefName}>
                            <SelectValue placeholder={t("placeholder-branch")}/>
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
                    {errors.targetRefName && (
                        <FieldError className="text-destructive">{t(errors.targetRefName)}</FieldError>
                    )}
                </Field>
            </FieldGroup>

            <div className="flex gap-2 justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                >
                    {isLoading && <Spinner data-icon="inline-start"/>}
                    {t("label-submit")}
                </Button>
                <Button onClick={onClose} variant="secondary" disabled={isLoading}>
                    {t("label-cancel")}
                </Button>
            </div>
        </div>
    );
}