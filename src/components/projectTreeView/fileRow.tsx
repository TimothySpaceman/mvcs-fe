import {DownloadSimpleIcon, FileIcon} from "@phosphor-icons/react";
import {TreeNode} from "@/components/projectTreeView/utils";
import {twMerge} from "tailwind-merge";

type Props = {
    node: Extract<TreeNode, { kind: "file" }>;
    depth: number;
    projectId: string;
}

export default function FileRow({node, depth, projectId}: Props) {
    const host = process.env.NEXT_PUBLIC_API_HOST ?? "";
    const downloadUrl = `${host}/projects/${projectId}/blobs/${node.snapshot.blobId}?filename=${node.name}`;

    return (
        <div
            className={twMerge(
                "group/file-row flex items-center gap-1 py-1 text-xs",
                "text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors duration-100"
            )}
            style={{paddingLeft: `calc(${depth} * 1rem + 0.5rem)`}}
        >
            <FileIcon className="size-3.5 shrink-0 text-muted-foreground"/>
            <span className="flex-1 truncate">
                {node.name}
            </span>
            <a
                href={downloadUrl}
                download={node.name}
                title={node.name}
                className={twMerge(
                    "opacity-0 group-hover/file-row:opacity-100 transition-opacity duration-100 mr-2",
                    "inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <DownloadSimpleIcon className="size-3.5"/>
            </a>
        </div>
    );
}