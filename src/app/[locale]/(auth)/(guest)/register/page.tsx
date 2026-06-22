import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import RegisterForm from "@/app/[locale]/(auth)/(guest)/register/(components)/registerForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("RegisterPage.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page() {
    const t = await getTranslations("RegisterPage");

    return <main className="p-2 grow-1 flex flex-col items-center justify-center">
        <Card className="max-w-100 w-full">
            <CardHeader>
                <CardTitle>
                    <h1 className="text-center font-bold text-2xl">{t("title")}</h1>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <RegisterForm/>
            </CardContent>
        </Card>
    </main>
}