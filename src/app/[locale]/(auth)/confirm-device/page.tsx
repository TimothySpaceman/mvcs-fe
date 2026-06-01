import type {Metadata} from "next";
import {getLocale, getTranslations} from "next-intl/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import ConfirmForm from "@/app/[locale]/(auth)/confirm-device/(components)/confirmForm";
import {createLoader, parseAsString, SearchParams} from "nuqs/server";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";
import {redirect} from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("ConfirmDevice.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

const searchParams = {
    code: parseAsString.withDefault("")
};
const loadSearchParams = createLoader(searchParams);

type Props = {
    searchParams: Promise<SearchParams>;
};

export default async function Page({searchParams}: Props) {
    const t = await getTranslations("ConfirmDevice");

    const {code} = await loadSearchParams(searchParams);
    const user = await getCurrentUser();
    if (!user) {
        const redirectTo = `/confirm-device?${new URLSearchParams({code: code})}`;
        const params = new URLSearchParams({redirectTo});
        redirect({
            href: `/login?${params}`,
            locale: await getLocale()
        });
    }

    return <main className="p-2 grow-1 flex flex-col items-center justify-center">
        <Card className="max-w-120 w-full">
            <CardHeader>
                <CardTitle>
                    <h1 className="text-center font-bold text-2xl">{t("title")}</h1>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ConfirmForm codeAutofill={code}/>
            </CardContent>
        </Card>
    </main>
}