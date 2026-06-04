"use client";

import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldContent} from "@/components/ui/field";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Spinner} from "@/components/ui/spinner";
import {Button} from "@/components/ui/button";
import {ChangeEvent, SubmitEvent, useState} from "react";
import {api} from "@/lib/api";
import {useRouter} from "@/i18n/navigation";
import {toast} from "sonner";
import useSWR from "swr";
import {Storage} from "@/lib/entities/storage";
import {Project} from "@/lib/entities/project";

type Errors = {
    title?: string;
    description?: string;
    storageId?: string;
};

type NewProjectSchema = {
    title: string;
    description: string;
    isPublic: boolean;
    storageId: string | null;
};

export default function NewProjectForm() {
    const t = useTranslations("NewProjectPage.form");
    const router = useRouter();

    const {data: storages, isLoading: isStoragesLoading} = useSWR<Storage[]>("/storages");

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<NewProjectSchema>({
        title: "",
        description: "",
        isPublic: false,
        storageId: null,
    });

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
        setErrors(prev => ({...prev, [name]: undefined}));
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.storageId) {
            setErrors(prev => ({...prev, storageId: t("error-storage-required")}));
            return;
        }

        try {
            setIsLoading(true);

            const resp = await api.fetch("/projects", {
                auth: true,
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            });

            if (!resp.ok) {
                toast.error(t("error-internal-server"));
                return;
            }

            const project = await resp.json() as Project;
            router.push(`/projects/${project.id}`);
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    const canCreate = form.title.trim().length > 0 && !!form.storageId

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="new-project-title-input">
                        {t("label-title")}
                    </FieldLabel>
                    <Input
                        id="new-project-title-input"
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        aria-invalid={!!errors.title}
                    />
                    {errors.title && (
                        <FieldError className="text-destructive">
                            {t(errors.title)}
                        </FieldError>
                    )}
                </Field>

                <Field data-invalid={!!errors.description}>
                    <FieldLabel htmlFor="new-project-description-input">
                        {t("label-description")}
                    </FieldLabel>
                    <Textarea
                        id="new-project-description-input"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        disabled={isLoading}
                        aria-invalid={!!errors.description}
                    />
                    {errors.description && (
                        <FieldError className="text-destructive">
                            {t(errors.description)}
                        </FieldError>
                    )}
                </Field>

                <Field orientation="horizontal">
                    <Checkbox
                        id="new-project-is-public-input"
                        name="isPublic"
                        checked={form.isPublic}
                        onCheckedChange={(checked) => {
                            if (checked !== "indeterminate") {
                                setForm(prev => ({...prev, isPublic: checked}));
                            }
                        }}
                        disabled={isLoading}
                    />
                    <FieldContent>
                        <FieldLabel htmlFor="new-project-is-public-input">
                            {t("label-is-public")}
                        </FieldLabel>
                        <FieldDescription>
                            {t("description-is-public")}
                        </FieldDescription>
                    </FieldContent>
                </Field>

                <Field data-invalid={!!errors.storageId}>
                    <FieldLabel htmlFor="new-project-storage-input">
                        {t("label-storage")}
                        {isStoragesLoading && <Spinner className="size-4" data-icon="inline-end"/>}
                    </FieldLabel>
                    <Select
                        value={form.storageId ?? undefined}
                        onValueChange={(value) => {
                            setForm(prev => ({...prev, storageId: value}));
                            setErrors(prev => ({...prev, storageId: undefined}));
                        }}
                        disabled={isLoading || isStoragesLoading}
                        required
                    >
                        <SelectTrigger
                            id="new-project-storage-input"
                            aria-invalid={!!errors.storageId}
                            className="flex-1"
                        >
                            <SelectValue placeholder={t("placeholder-storage")}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {storages?.map(storage => (
                                    <SelectItem
                                        key={`storage-option-${storage.id}`}
                                        value={storage.id}
                                    >
                                        {storage.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.storageId && (
                        <FieldError className="text-destructive">
                            {errors.storageId}
                        </FieldError>
                    )}
                </Field>
            </FieldGroup>

            <Field>
                <Button
                    type="submit"
                    className="ml-auto mr-0 grow-0 !w-max"
                    disabled={isLoading || isStoragesLoading || !canCreate}
                >
                    {isLoading && <Spinner data-icon="inline-start"/>} {t("label-submit")}
                </Button>
            </Field>
        </form>
    );
}