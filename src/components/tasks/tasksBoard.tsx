"use client";

import useSWR from "swr";
import {useTranslations} from "next-intl";
import {Task, TaskStatus, TASK_STATUS_ORDER} from "@/lib/entities/task";
import {Spinner} from "@/components/ui/spinner";
import {WarningCircleIcon, CheckSquareIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";
import TaskCard from "@/components/tasks/taskCard";

type Props = {
    projectId: string;
    className?: string;
};

type ColumnProps = {
    projectId: string;
    status: TaskStatus;
    tasks: Task[];
};

function BoardColumn({projectId, status, tasks}: ColumnProps) {
    const t = useTranslations("ProjectPage.tasks");

    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2 px-0.5 py-1 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t(`status-${status}`)}
                </span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {tasks.length}
                </span>
            </div>
            <div className="flex flex-col gap-1.5">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} projectId={projectId}/>
                ))}
            </div>
        </div>
    );
}

export default function TasksBoard({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.tasks");

    const {data: tasks, isLoading, error} = useSWR<Task[]>(
        `/projects/${projectId}/tasks`
    );

    if (isLoading) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <Spinner className="size-8"/>
            <span className="text-muted-foreground">{t("label-loading")}</span>
        </div>
    );

    if (error) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6 text-destructive", className)}>
            <WarningCircleIcon className="size-8"/>
            <span>{t("error-failed")}</span>
        </div>
    );

    const byStatus = TASK_STATUS_ORDER.reduce<Record<TaskStatus, Task[]>>(
        (acc, s) => ({...acc, [s]: []}),
        {} as Record<TaskStatus, Task[]>
    );
    for (const task of tasks ?? []) {
        byStatus[task.status]?.push(task);
    }

    const isEmpty = (tasks?.length ?? 0) === 0;

    return (
        <div className={className}>
            {isEmpty ? (
                <div className="flex flex-col items-center gap-2 py-6">
                    <CheckSquareIcon className="size-8 text-muted-foreground"/>
                    <span className="text-muted-foreground">{t("label-empty")}</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TASK_STATUS_ORDER.map(status => (
                        <BoardColumn
                            key={status}
                            projectId={projectId}
                            status={status}
                            tasks={byStatus[status]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}