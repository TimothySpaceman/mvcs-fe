import type {Metadata} from "next";
import "../globals.css";
import {NextIntlClientProvider} from "next-intl";
import {getTranslations} from "next-intl/server";
import {UserProvider} from "@/components/userProvider/userProvider";
import {ThemeProvider} from "@/components/themeProvider/themeProvider";
import Header from "@/components/header/header";
import {GeistSans} from "geist/font/sans"
import {GeistMono} from "geist/font/mono"
import {PropsWithChildren} from "react";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("global.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function RootLayout({children}: PropsWithChildren) {
    return (
        <html
            lang="ua"
            className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
            <UserProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Header/>
                    {children}
                </ThemeProvider>
            </UserProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
