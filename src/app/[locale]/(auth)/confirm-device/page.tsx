import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import ConfirmForm from "@/app/[locale]/(auth)/confirm-device/(components)/confirmForm";
import {createLoader, parseAsString, SearchParams} from "nuqs/server";

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

export default async function Page({ searchParams }: Props){
    const t = await getTranslations("ConfirmDevice");

    const {code} = await loadSearchParams(searchParams);

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