import {useModal} from "@/components/modal/modalProvider";
import TaskModal from "@/components/tasks/taskModal";
import TasksBoard from "@/components/tasks/tasksBoard";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {useSWRConfig} from "swr";
import {PlusIcon} from "@phosphor-icons/react";

type Props = {
    projectId: string;
    readonly?: boolean;
};

export default function TasksTab({projectId, readonly}: Props) {
    const t = useTranslations("ProjectPage.tasks");
    const {addModal} = useModal();
    const {mutate} = useSWRConfig();

    function handleNewTask() {
        if(readonly) return;
        addModal((onClose) => (
            <TaskModal
                projectId={projectId}
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
        <div className="flex flex-col gap-2">
            {!readonly && <div className="flex justify-end">
                <Button onClick={handleNewTask}>
                    <PlusIcon data-icon="inline-start"/>
                    {t("label-new")}
                </Button>
            </div>}
            <TasksBoard projectId={projectId} readonly={readonly}/>
        </div>
    );
}
