"use client";

import {useUser} from "@/components/userProvider/userProvider";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import UserMenu from "@/components/header/userMenu";
import {Spinner} from "@/components/ui/spinner";
import {FolderPlusIcon} from "@phosphor-icons/react";

export default function Header() {
    const {user, isLoading} = useUser();

    const t = useTranslations("Header");

    return <header className="sticky top-0 z-10 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="font-bold text-3xl">MVCS</Link>
            <div className="flex items-center gap-2">
                {user && <>
                    <Button asChild className="mr-2">
                        <Link href="/projects/new">
                            <FolderPlusIcon data-icon="inline-start"/>
                            {t("label-create-project")}
                        </Link>
                    </Button>
                </>}
                {isLoading && <Spinner className="size-4"/>}
                {user ? <UserMenu/> : <Button asChild>
                    <Link href="/login">{t("label-login")}</Link>
                </Button>}
            </div>
        </div>
    </header>
}