"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {LockKeyIcon, UserIcon} from "@phosphor-icons/react";
import {useTranslations} from "next-intl";
import {parseAsStringLiteral, useQueryState} from "nuqs";
import Container from "@/components/container/container";
import {Separator} from "@/components/ui/separator";
import ProfileTab from "@/app/[locale]/settings/(components)/profileTab";
import SessionsTab from "@/app/[locale]/settings/(components)/sessionsTab";

const TabNames = ["profile", "sessions"] as const;
type TabName = typeof TabNames[number];

export default function SettingsTabs() {
    const t = useTranslations("SettingsPage");

    const [tab, setTab] = useQueryState(
        "tab",
        parseAsStringLiteral(TabNames).withDefault("profile")
    );

    return (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabName)}>
            <Container className="max-w-3xl" rootClassName="!p-0">
                <TabsList variant="line" className="!px-0">
                    <TabsTrigger value="profile">
                        <UserIcon/>
                        {t("tabs.label-profile")}
                    </TabsTrigger>
                    <TabsTrigger value="sessions">
                        <LockKeyIcon/>
                        {t("tabs.label-sessions")}
                    </TabsTrigger>
                </TabsList>
            </Container>

            <Separator className="!m-0"/>

            <TabsContent value="profile">
                <Container className="max-w-3xl" rootClassName="!px-0 !pt-0">
                    <ProfileTab/>
                </Container>
            </TabsContent>

            <TabsContent value="sessions">
                <Container className="max-w-3xl" rootClassName="!px-0 !pt-0">
                    <SessionsTab/>
                </Container>
            </TabsContent>
        </Tabs>
    );
}