export type DeviceInfo = {
    userAgent?: string
    device?: string
    os?: string
    browser?: string
}

export type Session = {
    id: string;
    userId: string;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    createdAt: string;
    lastActiveAt: string;
};