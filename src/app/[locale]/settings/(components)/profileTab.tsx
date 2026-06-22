"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {api} from "@/lib/api";
import {useUser} from "@/components/userProvider/userProvider";
import {User} from "@/lib/auth/types";
import useSWR, {useSWRConfig} from "swr";
import {Field, FieldGroup, FieldLabel, FieldError} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function ProfileTab() {
    const t = useTranslations("SettingsPage.profile");
    const {refreshUserData} = useUser();
    const {mutate} = useSWRConfig();

    const {data: user, isLoading} = useSWR<User>("/auth/me");

    const [displayName, setDisplayName] = useState("");
    const [displayNameError, setDisplayNameError] = useState<string | undefined>();
    const [isDisplayNameLoading, setIsDisplayNameLoading] = useState(false);

    useEffect(() => {
        if (user) setDisplayName(user.displayName);
    }, [user]);

    const displayNameDirty = displayName.trim() !== (user?.displayName ?? "");

    async function handleDisplayNameSubmit() {
        if (!displayName.trim()) {
            setDisplayNameError(t("form.error-display-name-required"));
            return;
        }

        try {
            setIsDisplayNameLoading(true);
            const resp = await api.fetch(`/users/${user!.id}`, {
                auth: true,
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({displayName: displayName.trim()}),
            });

            if (resp.ok) {
                toast.success(t("form.toast-success"));
                await mutate("/auth/me");
                await refreshUserData();
            } else {
                toast.error(t("form.error-internal-server"));
            }
        } catch {
            toast.error(t("form.error-internal-server"));
        } finally {
            setIsDisplayNameLoading(false);
        }
    }

    if (isLoading || !user) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <Spinner className="size-6 text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="text-base text-muted-foreground">{t("section-avatar")}</span>
            <div className="flex items-center gap-4 py-2">
                <Avatar size="lg" className="!size-16">
                    <AvatarImage src={user.avatar?.url}/>
                    <AvatarFallback className="text-xl">
                        {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <Button variant="outline" disabled>
                    {t("form.label-upload-avatar")}
                </Button>
            </div>

            <Separator className="my-1"/>

            <span className="text-base text-muted-foreground">{t("section-general")}</span>
            <div className="space-y-4">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="settings-username-input">
                            {t("form.label-username")}
                        </FieldLabel>
                        <Input
                            id="settings-username-input"
                            type="text"
                            value={user.username}
                            disabled
                        />
                    </Field>

                    <Field data-invalid={!!displayNameError}>
                        <FieldLabel htmlFor="settings-display-name-input">
                            {t("form.label-display-name")}
                        </FieldLabel>
                        <Input
                            id="settings-display-name-input"
                            type="text"
                            value={displayName}
                            onChange={e => {
                                setDisplayName(e.target.value);
                                setDisplayNameError(undefined);
                            }}
                            disabled={isDisplayNameLoading}
                            aria-invalid={!!displayNameError}
                        />
                        {displayNameError && (
                            <FieldError>{displayNameError}</FieldError>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="settings-email-input">
                            {t("form.label-email")}
                        </FieldLabel>
                        <Input
                            id="settings-email-input"
                            type="email"
                            value={user.email}
                            disabled
                        />
                    </Field>
                </FieldGroup>

                <Button
                    onClick={handleDisplayNameSubmit}
                    disabled={!displayNameDirty || isDisplayNameLoading || !displayName.trim()}
                >
                    {isDisplayNameLoading && <Spinner data-icon="inline-start"/>}
                    {t("form.label-save")}
                </Button>
            </div>

            <Separator className="my-1"/>

            <span className="text-base text-muted-foreground">{t("section-password")}</span>
            <div className="space-y-4">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="settings-current-password-input">
                            {t("form.label-current-password")}
                        </FieldLabel>
                        <Input
                            id="settings-current-password-input"
                            type="password"
                            disabled
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="settings-new-password-input">
                            {t("form.label-new-password")}
                        </FieldLabel>
                        <Input
                            id="settings-new-password-input"
                            type="password"
                            disabled
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="settings-confirm-password-input">
                            {t("form.label-confirm-password")}
                        </FieldLabel>
                        <Input
                            id="settings-confirm-password-input"
                            type="password"
                            disabled
                        />
                    </Field>
                </FieldGroup>

                <Button variant="outline" disabled>
                    {t("form.label-change-password")}
                </Button>
            </div>
        </div>
    );
}