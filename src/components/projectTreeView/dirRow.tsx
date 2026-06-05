import {useState} from "react";
import {CaretRightIcon, FolderIcon, FolderOpenIcon} from "@phosphor-icons/react";
import {countFiles, TreeNode} from "@/components/projectTreeView/utils";
import FileRow from "@/components/projectTreeView/fileRow";
import {twMerge} from "tailwind-merge";

type Props = {
    node: Extract<TreeNode, { kind: "dir" }>;
    depth: number;
    projectId: string;
}

export default function DirRow({node, depth, projectId}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={twMerge(
                    "w-full flex items-center gap-1 py-1 text-xs text-left",
                    "text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors duration-100"
                )}
                style={{paddingLeft: `calc(${depth} * 1rem + 0.5rem)`}}
            >
                <CaretRightIcon
                    className={twMerge(
                        "size-3 shrink-0 text-muted-foreground transition-transform duration-150",
                        open && "rotate-90",
                    )}
                />
                {open
                    ? <FolderOpenIcon className="size-4 shrink-0 text-foreground/70"/>
                    : <FolderIcon className="size-4 shrink-0 text-muted-foreground"/>
                }
                <span className="flex-1 truncate">{node.name}</span>
                <span className="text-muted-foreground/60 tabular-nums text-xs mr-2">
                    {countFiles(node)}
                </span>
            </button>

            {open && (
                <div>
                    {node.children.map((child) =>
                        child.kind === "dir"
                            ? <DirRow
                                key={child.name}
                                node={child}
                                depth={depth + 1}
                                projectId={projectId}
                            />
                            : <FileRow
                                key={child.snapshot.filePath}
                                node={child}
                                depth={depth + 1}
                                projectId={projectId}
                            />
                    )}
                </div>
            )}
        </div>
    );
}
