import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircleIcon} from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("ConfirmDeviceSuccess");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const t = await getTranslations("ConfirmDeviceSuccess");

    return <main className="p-2 grow-1 flex flex-col items-center justify-center">
        <Card className="max-w-120 w-full">
            <CardHeader>
                <CardTitle className="flex flex-col items-center">
                    <CheckCircleIcon size={64} className="text-green-600" />
                    <h1 className="text-center font-bold text-2xl">{t("title")}</h1>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center">{t("description")}</p>
            </CardContent>
        </Card>
    </main>
}