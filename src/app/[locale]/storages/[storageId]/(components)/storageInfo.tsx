import {Storage} from "@/lib/entities/storage";
import {Badge} from "@/components/ui/badge";
import {
    AmazonLogoIcon,
    DatabaseIcon,
    DropboxLogoIcon,
    GoogleDriveLogoIcon,
    HardDrivesIcon
} from "@phosphor-icons/react/ssr";
import {ReactNode} from "react";
import {getTranslations} from "next-intl/server";
import {twMerge} from "tailwind-merge";

const storageIcons: { [key: string]: ReactNode } = {
    "aws-s3": <AmazonLogoIcon/>,
    "google-drive": <GoogleDriveLogoIcon/>,
    "dropbox": <DropboxLogoIcon/>,
    "ftp": <HardDrivesIcon/>
}

type Props = {
    storage: Storage
    className?: string
}

export default async function StorageInfo({storage, className}: Props) {
    const t = await getTranslations("Storage.info");

    return <div className={twMerge("flex flex-col gap-2", className)}>
        <h1 className="font-bold text-2xl">{storage.name}</h1>
        <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary">
                {storageIcons[storage.storageType.key] ?? <DatabaseIcon/>}
                {storage.storageType.label}
            </Badge>
            {storage.isDefault && <Badge>
                {t("badge-default")}
            </Badge>}
            {storage.isPublic && <Badge variant="outline">
                {t("badge-public")}
            </Badge>}
        </div>
    </div>
}