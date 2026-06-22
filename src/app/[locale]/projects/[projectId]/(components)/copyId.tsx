"use client"

import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {twMerge} from "tailwind-merge";
import {CopyIcon} from "@phosphor-icons/react";

type Props = {
    projectId: string;
    className?: string;
}

export default function CopyId({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.info")

    async function handleCopyId() {
        try {
            await navigator.clipboard.writeText(projectId);
            toast.success(t("toast-copied"));
        } catch {
            toast.error(t("toast-copy-failed"));
        }
    }

    return <button
        type="button"
        onClick={handleCopyId}
        className={twMerge(
            "group w-max relative flex items-center gap-1 font-mono",
            "hover:text-muted-foreground transition-colors duration-200",
            className
        )}
    >
        <span
            className={twMerge(
                "inline-block overflow-hidden whitespace-nowrap max-w-[8ch]",
                "group-hover:max-w-[36ch] transition-all duration-500 ease-in-out"
            )}
        >
            {projectId}
        </span>
        <CopyIcon/>
    </button>;
}