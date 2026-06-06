"use client";

import {useMemo} from "react";
import useSWR from "swr";
import {useQueryState, parseAsString} from "nuqs";
import {WarningCircleIcon, FolderSimpleDashedIcon} from "@phosphor-icons/react";
import {Spinner} from "@/components/ui/spinner";
import {Snapshot} from "@/lib/entities/project";
import {useTranslations} from "next-intl";
import {buildTree} from "@/components/projectFilesView/utils";
import DirRow from "@/components/projectFilesView/dirRow";
import FileRow from "@/components/projectFilesView/fileRow";
import {twMerge} from "tailwind-merge";

type Props = {
    projectId: string;
    className?: string;
};

export default function ProjectFilesView({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.files");

    const [refName] = useQueryState("refName", parseAsString);
    const [commitId] = useQueryState("commitId", parseAsString);

    const params = new URLSearchParams();
    if (refName) params.set("refName", refName);
    if (commitId) params.set("commitId", commitId);
    const url = `/projects/${projectId}/vcs/snapshot?${params.toString()}`;

    const {data, error, isLoading} = useSWR<Snapshot>(url);

    const tree = useMemo(() => {
        return data ? buildTree(data.files) : [];
    }, [data]);

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

    if (tree.length === 0) return (
        <div className={twMerge("flex flex-col items-center gap-2 py-6", className)}>
            <FolderSimpleDashedIcon className="size-8"/>
            <span>{t("label-empty")}</span>
        </div>
    );

    return (
        <div className={twMerge("border border-border", className)}>
            {tree.map((node) =>
                node.kind === "dir"
                    ? <DirRow key={node.name} node={node} depth={0} projectId={projectId}/>
                    : <FileRow key={node.snapshot.filePath} node={node} depth={0} projectId={projectId}/>
            )}
        </div>
    );
}