import {DeviceInfo as DeviceInfoType} from "@/lib/auth/types";
import {twMerge} from "tailwind-merge";
import {
    AndroidLogoIcon,
    AppleLogoIcon, CompassIcon, DevicesIcon,
    GoogleChromeLogoIcon,
    LinuxLogoIcon,
    SquaresFourIcon,
    type Icon
} from "@phosphor-icons/react";
import {useTranslations} from "next-intl";

const CLIENT_APPS = [
    "ClientApp"
] as const;
const CLIENT_APP_REGEX = new RegExp(
    `^(${CLIENT_APPS.join("|")})(?:\\/([\\d.]+))?`
);
const UNKNOWN_VALUE = "unknown";

type Props = {
    data: DeviceInfoType
    className?: string
}

const deviceIcons: Record<string, Icon> = {
    "macOS": AppleLogoIcon,
    "Windows": SquaresFourIcon,
    "Linux": LinuxLogoIcon,
    "Android": AndroidLogoIcon,
    "iOS": AppleLogoIcon,
    "Chrome": GoogleChromeLogoIcon,
    "Safari": CompassIcon,
}

const hasValue = (field?: string) => field && field !== UNKNOWN_VALUE

const getDeviceName = (value: string | undefined, fallback: string) => hasValue(value) ? value! : fallback;

const getAppName = (browser: string | undefined, userAgent: string | undefined, fallback: string) => {
    if (hasValue(browser)) return browser!;
    if (!hasValue(userAgent)) return fallback;

    const match = userAgent!.match(CLIENT_APP_REGEX);
    if (!match) return fallback;

    const name = match[1];
    const version = match[2];
    return version ? `${name} ${version}` : name;
}


export default function DeviceInfo({data, className}: Props) {
    const t = useTranslations("DeviceInfo")

    const DeviceIcon =
        deviceIcons[data.browser ?? ""] ??
        deviceIcons[data.os ?? ""] ??
        DevicesIcon;

    const deviceName = getDeviceName(data.device, t("label-unknown-device"));
    const appName = getAppName(data.browser, data.userAgent, t("label-unknown-app"));

    return <div className={twMerge("flex gap-2", className)}>
        <DeviceIcon className="size-12 shrink-0"/>
        <div className="flex flex-col min-w-0">
            <p className="text-lg font-medium truncate">{deviceName}</p>
            <p className="text-base truncate">{appName}</p>
        </div>
    </div>
}