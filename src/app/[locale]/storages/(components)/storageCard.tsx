import {Storage} from "@/lib/entities/storage";
import {useTranslations} from "next-intl";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    AmazonLogoIcon,
    DatabaseIcon,
    DropboxLogoIcon,
    GearIcon,
    GoogleDriveLogoIcon,
    HardDrivesIcon
} from "@phosphor-icons/react";
import {ReactNode} from "react";
import {Link} from "@/i18n/navigation";

const storageIcons: { [key: string]: ReactNode } = {
    "aws-s3": <AmazonLogoIcon/>,
    "google-drive": <GoogleDriveLogoIcon/>,
    "dropbox": <DropboxLogoIcon/>,
    "ftp": <HardDrivesIcon/>
}

type Props = {
    storage: Storage;
}

export default function StorageCard({storage}: Props) {
    const t = useTranslations("Storages.card");

    return <Card>
        <CardHeader>
            <CardTitle>
                <h2 className="text-xl font-bold">{storage.name}</h2>
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-1">
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
            </CardDescription>
            <CardAction>
                <Button size="icon-sm" variant="secondary" asChild>
                    <Link href={`/storages/${storage.id}`}><GearIcon/></Link>
                </Button>
            </CardAction>
        </CardHeader>
    </Card>
}