import {FileSnapshot} from "@/lib/entities/project";

export type TreeNode =
    | { kind: "dir"; name: string; children: TreeNode[] }
    | { kind: "file"; name: string; snapshot: FileSnapshot };

type DirBucket = { dirs: Record<string, DirBucket>; files: FileSnapshot[] };

export function buildTree(files: Record<string, FileSnapshot>): TreeNode[] {
    const root: DirBucket = {dirs: {}, files: []};

    for (const snapshot of Object.values(files)) {
        const parts = snapshot.filePath.split("/").filter(part => part.length > 0);

        let cursor = root;
        for (let i = 0; i < parts.length - 1; i++) {
            const segment = parts[i];
            cursor.dirs[segment] ??= {dirs: {}, files: []};
            cursor = cursor.dirs[segment];
        }

        cursor.files.push(snapshot);
    }

    function toNodes(bucket: DirBucket): TreeNode[] {
        const dirs: TreeNode[] = Object.entries(bucket.dirs)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, child]) => ({kind: "dir", name, children: toNodes(child)}));

        const fileNodes: TreeNode[] = bucket.files
            .sort((a, b) => a.filePath.localeCompare(b.filePath))
            .map((snapshot) => ({
                kind: "file",
                name: snapshot.filePath.split("/").at(-1)!,
                snapshot,
            }));

        return [...dirs, ...fileNodes];
    }

    return toNodes(root);
}

export function countFiles(node: Extract<TreeNode, { kind: "dir" }>): number {
    let n = 0;
    for (const child of node.children) {
        if (child.kind === "file") n += 1;
        else n += countFiles(child);
    }
    return n;
}