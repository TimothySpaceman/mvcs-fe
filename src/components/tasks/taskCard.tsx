"use client";

import {Task, TaskStatus, TaskStatuses} from "@/lib/entities/task";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useModal} from "@/components/modal/modalProvider";
import UserInfo from "@/components/userInfo/userInfo";
import useSWR, {useSWRConfig} from "swr";
import {User} from "@/lib/auth/types";
import {CalendarIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";
import TaskModal from "@/components/tasks/taskModal";

type Props = {
    task: Task;
    projectId: string;
    readonly?: boolean;
};

function DeadlineBadge({deadline, status}: { deadline: string, status: TaskStatus }) {
    const date = new Date(deadline);
    const isPast = date < new Date();
    return (
        <span className={twMerge(
            "flex items-center gap-1 text-xs",
            (isPast && status !== TaskStatuses.done) ? "text-destructive" : "text-muted-foreground"
        )}>
            <CalendarIcon className="size-3"/>
            {date.toLocaleDateString()}
        </span>
    );
}

function AssigneeAvatars({assignments}: { assignments: Task["assignments"] }) {
    const ids = assignments.map(a => a.userId);
    const params = ids.map(id => `ids=${id}`).join("&");
    const {data: users} = useSWR<User[]>(ids.length > 0 ? `/users/bulk?${params}` : null);

    if (!users || users.length === 0) return null;

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {users.slice(0, 3).map(user => (
                <UserInfo
                    key={user.id}
                    avatarUrl={user.avatar?.url}
                    avatarSize="sm"
                    label={user.displayName}
                    labelShown={false}
                />
            ))}
            {users.length > 3 && (
                <span className="text-xs text-muted-foreground">+{users.length - 3}</span>
            )}
        </div>
    );
}

export default function TaskCard({task, projectId, readonly}: Props) {
    const {addModal} = useModal();
    const {mutate} = useSWRConfig();

    function handleOpen() {
        addModal((onClose) => (
            <TaskModal
                projectId={projectId}
                task={task}
                readonly={readonly}
                onClose={onClose}
                onSuccess={() => mutate(
                    (key) => typeof key === "string" && key.startsWith(`/projects/${projectId}/tasks`),
                    undefined,
                    {revalidate: true}
                )}
            />
        ), {closeOnBlur: false});
    }

    return (
        <Card
            className="!p-2 cursor-pointer hover:bg-muted/30 transition-colors duration-100"
            onClick={handleOpen}
        >
            <CardHeader className="!p-0 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                    {task.title}
                </CardTitle>
                {(task.deadline || task.assignments.length > 0) && (
                    <CardDescription className="flex items-center justify-between gap-2 flex-wrap">
                        {task.assignments.length > 0 && (
                            <AssigneeAvatars assignments={task.assignments}/>
                        )}
                        {task.deadline && <DeadlineBadge deadline={task.deadline} status={task.status}/>}
                    </CardDescription>
                )}
            </CardHeader>
        </Card>
    );
}