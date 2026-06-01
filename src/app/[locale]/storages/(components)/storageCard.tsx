import {Storage} from "@/lib/entities/storage";
import {useTranslations} from "next-intl";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {GearIcon} from "@phosphor-icons/react";

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
                    {storage.typeLabel}
                </Badge>
                {storage.isDefault && <Badge>
                    {t("badge-default")}
                </Badge>}
                {storage.isPublic && <Badge variant="outline">
                    {t("badge-public")}
                </Badge>}
            </CardDescription>
            <CardAction>
                <Button size="icon-sm" variant="secondary">
                    <GearIcon/>
                </Button>
            </CardAction>
        </CardHeader>
    </Card>
}