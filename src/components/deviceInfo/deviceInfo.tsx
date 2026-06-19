import {DeviceInfo as DeviceInfoType} from "@/lib/entities/session";
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
    ip?: string
    className?: string,
    iconClassName?: string,
    deviceClassName?: string,
    appClassName?: string,
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

const getDeviceName = (value: string | undefined, ip: string|undefined, fallback: string) => {
    const deviceName = hasValue(value) ? value! : fallback;
    return ip ? `${deviceName} (${ip})` : deviceName;
};

const getAppName = (browser: string | undefined, userAgent: string | undefined, fallback: string) => {
    if (hasValue(browser)) return browser!;
    if (!hasValue(userAgent)) return fallback;

    const match = userAgent!.match(CLIENT_APP_REGEX);
    if (!match) return fallback;

    const name = match[1];
    const version = match[2];
    return version ? `${name} ${version}` : name;
}


export default function DeviceInfo({data, ip, className, iconClassName, deviceClassName, appClassName}: Props) {
    const t = useTranslations("DeviceInfo")

    const DeviceIcon =
        deviceIcons[data.browser ?? ""] ??
        deviceIcons[data.os ?? ""] ??
        DevicesIcon;

    const deviceName = getDeviceName(data.device, ip, t("label-unknown-device"));
    const appName = getAppName(data.browser, data.userAgent, t("label-unknown-app"));

    return <div className={twMerge("flex gap-2", className)}>
        <DeviceIcon className={twMerge("size-12 shrink-0", iconClassName)}/>
        <div className="flex flex-col min-w-0">
            <p className={twMerge("text-lg font-medium truncate", deviceClassName)}>{deviceName}</p>
            <p className={twMerge("text-base truncate", appClassName)}>{appName}</p>
        </div>
    </div>
}