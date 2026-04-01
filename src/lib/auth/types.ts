export type UserAvatar = {
    id: string,
    url: string,
    sizeBytes: number,
    mimeType: string,
    createdAt: string,
}

export type User = {
    id: string,
    username: string,
    displayName: string,
    email: string,
    isEmailVerified: boolean,
    avatar: UserAvatar | null,
    createdAt: string,
    updatedAt: string,
}

export type DeviceInfo = {
    userAgent?: string
    device?: string
    os?: string
    browser?: string
}