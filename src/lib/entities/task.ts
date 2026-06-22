export const TaskStatuses = {
    toDo: "toDo",
    inProgress: "inProgress",
    review: "review",
    done: "done",
} as const;
export type TaskStatus = keyof typeof TaskStatuses;

export const TASK_STATUS_ORDER: TaskStatus[] = [
    TaskStatuses.toDo,
    TaskStatuses.inProgress,
    TaskStatuses.review,
    TaskStatuses.done,
];

export type TaskAssignment = {
    userId: string;
};

export type Task = {
    id: string;
    projectId: string;
    authorId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    commitId: string | null;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
    assignments: TaskAssignment[];
};