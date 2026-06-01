import {PropsWithChildren} from "react";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";
import {redirect} from "@/i18n/navigation";
import {getLocale} from "next-intl/server";


export default async function Layout({children}: PropsWithChildren) {
    const user = await getCurrentUser();
    if (user) redirect({
        href: "/",
        locale: await getLocale()
    });
    return <>{children}</>;
}