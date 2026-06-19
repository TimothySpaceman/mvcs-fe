"use client";

import {useTranslations} from "next-intl";
import {LockKeyIcon} from "@phosphor-icons/react";

export default function SessionsTab() {
    const t = useTranslations("SettingsPage.sessions");

    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <LockKeyIcon className="size-8 opacity-40"/>
            <p className="text-sm">{t("placeholder")}</p>
        </div>
    );
}