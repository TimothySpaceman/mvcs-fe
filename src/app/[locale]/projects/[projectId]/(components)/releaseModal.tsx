"use client";

import {useTranslations} from "next-intl";
import {useEffect, useMemo, useState} from "react";
import useSWR from "swr";
import {Ref, Snapshot} from "@/lib/entities/project";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Checkbox} from "@/components/ui/checkbox";
import {FileIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";

type Props = {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
};

type Errors = {
    title?: string;
    refName?: string;
    files?: string;
};

type SnapshotFile = {
    fileName: string;
    filePath: string;
    blobId: string;
};

export default function ReleaseModal({projectId, onClose, onSuccess}: Props) {
    const t = useTranslations("ProjectPage.releases.createModal");

    const {data: refs, isLoading: isRefsLoading} = useSWR<Ref[]>(`/projects/${projectId}/vcs/refs`);

    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [refName, setRefName] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [errors, setErrors] = useState<Errors>({});

    const snapshotUrl = refName
        ? `/projects/${projectId}/vcs/snapshot?refName=${encodeURIComponent(refName)}`
        : null;
    const {data: snapshot, error: snapshotError, isLoading: isSnapshotLoading} = useSWR<Snapshot>(snapshotUrl);

    const files = useMemo<SnapshotFile[]>(() => {
        if (!snapshot) return [];
        return Object.values(snapshot.files)
            .sort((a, b) => a.filePath.localeCompare(b.filePath))
            .map((file) => ({
                fileName: file.filePath.split("/").at(-1)!,
                filePath: file.filePath,
                blobId: file.blobId,
            }));
    }, [snapshot]);

    useEffect(() => {
        setSelected(new Set(files.map((file) => file.blobId)));
    }, [files]);

    function setTitleField(value: string) {
        setTitle(value);
        setErrors(prev => ({...prev, title: undefined}));
    }

    function setRefField(value: string) {
        setRefName(value);
        setErrors(prev => ({...prev, refName: undefined, files: undefined}));
    }

    function toggleFile(blobId: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(blobId)) next.delete(blobId);
            else next.add(blobId);
            return next;
        });
        setErrors(prev => ({...prev, files: undefined}));
    }

    function validate(): boolean {
        const newErrors: Errors = {};
        if (!title.trim()) newErrors.title = "error-title-required";
        if (!refName) newErrors.refName = "error-ref-required";
        if (refName && selected.size === 0) newErrors.files = "error-files-required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;

        const selectedFiles = files.filter((file) => selected.has(file.blobId));

        try {
            setIsLoading(true);

            const resp = await api.fetch(`/projects/${projectId}/releases`, {
                auth: true,
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: title.trim(),
                    files: selectedFiles,
                }),
            });

            if (resp.ok) {
                toast.success(t("toast-success"));
                onSuccess();
                onClose();
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
    const canSubmit = !!title.trim() && !!refName && selected.size > 0 && !isSnapshotLoading;

    return (
        <div className="space-y-4 w-80">
            <h2 className="font-bold text-xl">{t("title")}</h2>

            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="release-title-input">
                        {t("label-title")}
                    </FieldLabel>
                    <Input
                        id="release-title-input"
                        type="text"
                        value={title}
                        onChange={e => setTitleField(e.target.value)}
                        disabled={isLoading}
                        aria-invalid={!!errors.title}
                    />
                    {errors.title && (
                        <FieldError className="text-destructive">{t(errors.title)}</FieldError>
                    )}
                </Field>

                <Field data-invalid={!!errors.refName}>
                    <FieldLabel>
                        {t("label-branch")}
                        {isRefsLoading && <Spinner data-icon="inline-end"/>}
                    </FieldLabel>
                    <Select
                        value={refName ?? undefined}
                        onValueChange={setRefField}
                        disabled={refsDisabled}
                    >
                        <SelectTrigger aria-invalid={!!errors.refName}>
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
                    {errors.refName && (
                        <FieldError className="text-destructive">{t(errors.refName)}</FieldError>
                    )}
                </Field>

                {refName && (
                    <Field data-invalid={!!errors.files}>
                        <FieldLabel>{t("label-files")}</FieldLabel>

                        {isSnapshotLoading && (
                            <div className="flex items-center gap-2 py-3 text-muted-foreground">
                                <Spinner className="size-4"/>
                                <span>{t("label-loading-files")}</span>
                            </div>
                        )}

                        {snapshotError && (
                            <div className="flex items-center gap-2 py-3 text-destructive">
                                <WarningCircleIcon className="size-4"/>
                                <span>{t("error-files-failed")}</span>
                            </div>
                        )}

                        {!isSnapshotLoading && !snapshotError && files.length === 0 && (
                            <div className="py-3 text-muted-foreground">
                                {t("label-files-empty")}
                            </div>
                        )}

                        {!isSnapshotLoading && !snapshotError && files.length > 0 && (
                            <div className="max-h-56 overflow-y-auto border border-border">
                                {files.map((file) => (
                                    <label
                                        key={file.blobId}
                                        className={twMerge(
                                            "group/file-row flex items-center gap-2 py-1 pl-2 pr-2 text-xs text-foreground/80",
                                            "hover:text-foreground hover:bg-muted/50 transition-colors duration-100 cursor-pointer"
                                        )}
                                    >
                                        <Checkbox
                                            checked={selected.has(file.blobId)}
                                            onCheckedChange={() => toggleFile(file.blobId)}
                                            disabled={isLoading}
                                        />
                                        <FileIcon className="size-3.5 shrink-0 text-muted-foreground"/>
                                        <span className="flex-1 truncate" title={file.filePath}>
                                            {file.fileName}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {errors.files && (
                            <FieldError className="text-destructive">{t(errors.files)}</FieldError>
                        )}
                    </Field>
                )}
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