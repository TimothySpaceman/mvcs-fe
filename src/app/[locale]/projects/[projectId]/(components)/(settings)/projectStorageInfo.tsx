import useSWR from "swr";
import {useTranslations} from "next-intl";
import {Storage} from "@/lib/entities/storage";
import {Spinner} from "@/components/ui/spinner";
import {WarningCircleIcon, DatabaseIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";
import {Link} from "@/i18n/navigation";

type Props = {
    storageId: string;
    className?: string;
};

export default function ProjectStorageInfo({storageId, className}: Props) {
    const t = useTranslations("ProjectPage.settings.storage");

    const {data: storage, isLoading, error} = useSWR<Storage>(`/storages/${storageId}`);

    if (isLoading) return (
        <div className={twMerge("flex items-center gap-2 text-muted-foreground", className)}>
            <Spinner className="size-4"/>
            <span>{t("label-loading")}</span>
        </div>
    );

    if (error) return (
        <div className={twMerge("flex items-center gap-2 text-destructive", className)}>
            <WarningCircleIcon className="size-6"/>
            <span>{t("error-failed")}</span>
        </div>
    );

    if (!storage) return null;

    return (
        <div className={twMerge("flex items-center gap-2", className)}>
            <DatabaseIcon className="size-8 shrink-0"/>
            <div className="flex flex-col min-w-0">
                <Link
                    href={`/storages/${storageId}`}
                    className="text-sm truncate hover:underline transition-colors duration-200"
                >
                    {storage.name}
                </Link>
                <span className="text-xs text-muted-foreground truncate">{storage.storageType.label}</span>
            </div>
        </div>
    );
}