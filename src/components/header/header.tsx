"use client";

import {useUser} from "@/components/userProvider/userProvider";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

export default function Header() {
    const {user} = useUser();

    const t = useTranslations("Header");

    return <header className="sticky top-0 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="font-bold text-3xl">MVCS</div>
            {user ?
                <pre>{user.id}</pre> :
                <Button asChild>
                    <Link href="/login">{t("label-login")}</Link>
                </Button>
            }
        </div>
    </header>
}