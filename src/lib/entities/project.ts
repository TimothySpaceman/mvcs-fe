export type Project = {
    id: string,
    authorId: string,
    title: string,
    description?: string,
    isPublic: boolean,
    isInitialized: boolean,
    createdAt: string,
    updatedAt: string
}

export type ProjectHealth = {
    isReachable: boolean
    error: string | null
}

export type FileSnapshot = {
    filePath: string;
    blobId: string;
    lastModified: string;
};

export type Snapshot = {
    files: Record<string, FileSnapshot>;
};