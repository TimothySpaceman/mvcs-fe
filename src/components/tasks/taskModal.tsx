"use client";

import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import useSWR from "swr";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {Task, TaskStatus, TaskStatuses, TASK_STATUS_ORDER} from "@/lib/entities/task";
import {User} from "@/lib/auth/types";
import {ProjectMember} from "@/lib/entities/project";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
} from "@/components/ui/combobox";

type Props = {
    projectId: string;
    task?: Task;
    initialStatus?: TaskStatus;
    onClose: () => void;
    onSuccess: () => void;
};

type FormState = {
    title: string;
    description: string;
    deadline: string;
    status: TaskStatus;
    assignedUsers: User[];
};

type Errors = {
    title?: string;
};

export default function TaskModal({projectId, task, initialStatus, onClose, onSuccess}: Props) {
    const t = useTranslations("ProjectPage.tasks.modal");
    const tRoot = useTranslations("ProjectPage.tasks");
    const isEditing = !!task;

    const {data: members, isLoading: isMembersLoading} = useSWR<ProjectMember[]>(
        `/projects/${projectId}/members`
    );

    const memberIds = members?.map(m => m.userId) ?? [];
    const bulkParams = memberIds.map(id => `ids=${id}`).join("&");
    const {data: memberUsers, isLoading: isUsersLoading} = useSWR<User[]>(
        memberIds.length > 0 ? `/users/bulk?${bulkParams}` : null
    );

    const users = memberUsers ?? [];
    const isLoading_users = isMembersLoading || isUsersLoading;

    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormState>({
        title: task?.title ?? "",
        description: task?.description ?? "",
        deadline: task?.deadline ? task.deadline.slice(0, 16) : "",
        status: task?.status ?? initialStatus ?? TaskStatuses.toDo,
        assignedUsers: [],
    });
    const [assignedUsersInitialized, setAssignedUsersInitialized] = useState(!task);

    useEffect(() => {
        if (assignedUsersInitialized || !task || users.length === 0) return;
        const resolved = task.assignments
            .map(a => users.find(u => u.id === a.userId))
            .filter((u): u is User => !!u);
        setForm(prev => ({...prev, assignedUsers: resolved}));
        setAssignedUsersInitialized(true);
    }, [users]);
    const [errors, setErrors] = useState<Errors>({});

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

    async function syncAssignments(taskId: string, previousUserIds: string[], nextUserIds: string[]) {
        const toAdd = nextUserIds.filter(id => !previousUserIds.includes(id));
        const toRemove = previousUserIds.filter(id => !nextUserIds.includes(id));

        await Promise.all([
            ...toAdd.map(userId =>
                api.fetch(`/projects/${projectId}/tasks/${taskId}/assignments`, {
                    auth: true,
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({userId}),
                })
            ),
            ...toRemove.map(userId =>
                api.fetch(`/projects/${projectId}/tasks/${taskId}/assignments/${userId}`, {
                    auth: true,
                    method: "DELETE",
                })
            ),
        ]);
    }

    async function handleSubmit() {
        if (!validate()) return;

        try {
            setIsLoading(true);

            const nextUserIds = form.assignedUsers.map(u => u.id);

            if (isEditing) {
                const resp = await api.fetch(`/projects/${projectId}/tasks/${task.id}`, {
                    auth: true,
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        title: form.title.trim(),
                        description: form.description.trim() || null,
                        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
                        status: form.status,
                        commitId: task.commitId,
                    }),
                });

                if (!resp.ok) {
                    toast.error(t("error-internal-server"));
                    return;
                }

                await syncAssignments(task.id, task.assignments.map(a => a.userId), nextUserIds);
            } else {
                const resp = await api.fetch(`/projects/${projectId}/tasks`, {
                    auth: true,
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        title: form.title.trim(),
                        description: form.description.trim() || null,
                        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
                        assignedUserIds: [],
                    }),
                });

                if (!resp.ok) {
                    toast.error(t("error-internal-server"));
                    return;
                }

                const created = await resp.json() as Task;
                await syncAssignments(created.id, [], nextUserIds);
            }

            toast.success(t("toast-success"));
            onSuccess();
            onClose();
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    const canSubmit = form.title.trim().length > 0;

    return (
        <div className="space-y-4 w-88">
            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="task-title-input">
                        {t("label-title")}
                    </FieldLabel>
                    <Input
                        id="task-title-input"
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
                    <FieldLabel htmlFor="task-description-input">
                        {t("label-description")}
                    </FieldLabel>
                    <Textarea
                        id="task-description-input"
                        value={form.description}
                        onChange={e => setField("description", e.target.value)}
                        disabled={isLoading}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="task-deadline-input">
                        {t("label-deadline")}
                    </FieldLabel>
                    <Input
                        id="task-deadline-input"
                        type="datetime-local"
                        value={form.deadline}
                        onChange={e => setField("deadline", e.target.value)}
                        disabled={isLoading}
                    />
                </Field>

                {isEditing && (
                    <Field>
                        <FieldLabel>{t("label-status")}</FieldLabel>
                        <Select
                            value={form.status}
                            onValueChange={v => setField("status", v as TaskStatus)}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {TASK_STATUS_ORDER.map(s => (
                                        <SelectItem key={s} value={s}>
                                            {tRoot(`status-${s}`)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                )}

                <Field>
                    <FieldLabel>
                        {t("label-assignees")}
                        {isLoading_users && <Spinner data-icon="inline-end"/>}
                    </FieldLabel>
                    <Combobox
                        items={users}
                        itemToStringValue={(u) => u.displayName}
                        multiple
                        value={form.assignedUsers}
                        onValueChange={(value) => setField("assignedUsers", value)}
                        disabled={isLoading || isLoading_users}
                    >
                        <ComboboxChips>
                            <ComboboxValue>
                                {form.assignedUsers.map(u => (
                                    <ComboboxChip key={u.id}>{u.displayName}</ComboboxChip>
                                ))}
                            </ComboboxValue>
                            <ComboboxChipsInput placeholder={t("placeholder-add-assignee")}/>
                        </ComboboxChips>
                        <ComboboxContent>
                            <ComboboxEmpty>{t("label-no-users")}</ComboboxEmpty>
                            <ComboboxList>
                                {(u) => (
                                    <ComboboxItem key={u.id} value={u}>
                                        {u.displayName}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </Field>
            </FieldGroup>

            <div className="flex gap-2 justify-end">
                <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
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