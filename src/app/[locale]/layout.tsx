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
import {Toaster} from "@/components/ui/sonner";
import {NuqsAdapter} from "nuqs/adapters/next";
import {getCurrentUser} from "@/lib/auth/getCurrentUser";
import {SWRProvider} from "@/components/swrProvider/swrProvider";
import {ModalProvider} from "@/components/modal/modalProvider";
import ModalContainer from "@/components/modal/modalContainer";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("global.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function RootLayout({children}: PropsWithChildren) {
    const user = await getCurrentUser();

    return (
        <html
            lang="ua"
            className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
            <NuqsAdapter>
                <SWRProvider>
                    <UserProvider initialUser={user}>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <ModalProvider>
                                <Header/>
                                {children}
                                <ModalContainer/>
                                <Toaster/>
                            </ModalProvider>
                        </ThemeProvider>
                    </UserProvider>
                </SWRProvider>
            </NuqsAdapter>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
