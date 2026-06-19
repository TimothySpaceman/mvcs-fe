export type UserAvatar = {
    id: string,
    url: string,
    sizeBytes: number,
    mimeType: string,
    createdAt: string,
}

export type UserMetadata = {
    id: string,
    username: string,
    displayName: string,
    isEmailVerified: boolean,
    avatar: UserAvatar | null,
}

export type User = UserMetadata & {
    email: string,
    createdAt: string,
    updatedAt: string,
}