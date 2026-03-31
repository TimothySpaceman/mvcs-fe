import type {Metadata} from "next";
import "../globals.css";
import {NextIntlClientProvider} from "next-intl";
import {getTranslations} from "next-intl/server";
import {UserProvider} from "@/components/userProvider/userProvider";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("global.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

type Props = {
    children: React.ReactNode;
};

export default function RootLayout({children}: Props) {
    return (
        <html lang="ua" className="h-full antialiased">
        <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
