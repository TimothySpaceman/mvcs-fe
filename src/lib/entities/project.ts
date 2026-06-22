export const ProjectAccessLevels = {
    owner: "owner",
    write: "write",
    read: "read",
    "public": "public",
} as const;
export type ProjectAccessLevel = keyof typeof ProjectAccessLevels;

const ACCESS_RANK: Record<ProjectAccessLevel, number> = {
    public: 0,
    read: 1,
    write: 2,
    owner: 3,
};

export function hasAccess(level: ProjectAccessLevel | null, minimum: ProjectAccessLevel) {
    return ACCESS_RANK[level ?? "public"] >= ACCESS_RANK[minimum];
}

export type Project = {
    id: string,
    authorId: string,
    title: string,
    description?: string,
    isPublic: boolean,
    isInitialized: boolean,
    defaultRefName?: string,
    createdAt: string,
    updatedAt: string,
    accessLevel: ProjectAccessLevel | null,
    storageId: string | null
}

export type ProjectHealth = {
    isReachable: boolean
    error: string | null
}

export type ProjectMember = {
    userId: string;
    accessLevel: ProjectAccessLevel;
};

export type FileSnapshot = {
    filePath: string;
    blobId: string;
    lastModified: string;
};

export type Snapshot = {
    files: Record<string, FileSnapshot>;
};

export type Ref = {
    name: string;
    commitId: string | null;
};

export type UserIdentity = {
    id: string | null;
    name: string;
    email: string | null;
};

export const CommitKinds = {
    "default": "default",
    "revert": "revert",
    "merge": "merge"
} as const;
type CommitKind = keyof typeof CommitKinds;

export type CommitInfo = {
    id: string;
    parentId: string | null;
    secondParentId: string | null;
    kind: CommitKind;
    message: string;
    author: UserIdentity;
    createdAt: string;
};

export type SnapshotMetadata = {
    commitId: string;
    data: Record<string, string[]>;
    submittedAt: string;
};

export type MergeRequest = {
    id: string;
    authorId: string;
    title: string;
    targetRefName: string;
    sourceRefName: string;
    mergeCommitId: string;
    createdAt: string;
};

export type ReleaseFile = {
    id: string;
    releaseId: string;
    fileName: string;
    blobId: string;
    createdAt: string;
};

export type Release = {
    id: string;
    projectId: string;
    authorId: string | null;
    title: string;
    createdAt: string;
    files: ReleaseFile[];
};