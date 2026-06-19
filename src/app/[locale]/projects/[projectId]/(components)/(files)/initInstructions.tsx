"use client";

import {CopyIcon, MusicNotesPlusIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Item, ItemContent} from "@/components/ui/item";
import {toast} from "sonner";

type Props = {
    projectId: string;
    className?: string;
}

export default function InitInstructions({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.init");

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(projectId);
            toast.success(t("toast-copied"));
        } catch {
            toast.error(t("toast-copy-failed"));
        }
    }

    return <div className={twMerge("p-4 flex flex-col gap-4 items-center", className)}>
        <MusicNotesPlusIcon className="size-24"/>
        <h2 className="text-2xl text-center font-bold">{t("title")}</h2>
        <p className="text-base">{t("description")}</p>
        <Item variant="outline" className="max-w-max p-1 pl-2">
            <ItemContent className="flex flex-row items-center justify-center gap-1 font-bold text-base">
                {projectId}
                <Button size="icon-sm" variant="secondary" onClick={handleCopy}>
                    <CopyIcon/>
                </Button>
            </ItemContent>
        </Item>
    </div>
}