"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import useSWR from "swr";
import {api} from "@/lib/api";
import {useUser} from "@/components/userProvider/userProvider";
import {useRouter} from "@/i18n/navigation";
import {Session} from "@/lib/entities/session";
import {useModal} from "@/components/modal/modalProvider";
import ConfirmModal from "@/components/confirmModal/confirmModal";
import DeviceInfo from "@/components/deviceInfo/deviceInfo";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {ArrowRightIcon, SignOutIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {Card, CardContent} from "@/components/ui/card";

export type SessionsPage = {
    items: Session[];
    limit: number;
    nextCursor: string | null;
};

export default function SessionsTab() {
    const t = useTranslations("SettingsPage.sessions");
    const {setUser, currentSessionId} = useUser();
    const router = useRouter();
    const {addModal} = useModal();

    const {data, isLoading, error, mutate} = useSWR<SessionsPage>("/auth/sessions");
    const sessions = data?.items ?? [];

    const [terminatingId, setTerminatingId] = useState<string | null>(null);
    const [isTerminatingAll, setIsTerminatingAll] = useState(false);

    async function logout() {
        await api.fetch("/auth/logout", {method: "POST"});
        setUser(undefined);
        router.push("/");
        router.refresh();
    }

    async function terminateSession(sessionId: string) {
        const isCurrent = sessionId === currentSessionId;
        setTerminatingId(sessionId);
        try {
            const resp = await api.fetch(`/auth/sessions/${sessionId}`, {
                auth: true,
                method: "DELETE",
            });
            if (!resp.ok) {
                toast.error(t("error-internal-server"));
                return;
            }
            if (isCurrent) await logout();
            else await mutate();
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setTerminatingId(null);
        }
    }

    async function terminateAll() {
        setIsTerminatingAll(true);
        try {
            const resp = await api.fetch("/auth/sessions", {
                auth: true,
                method: "DELETE",
            });
            if (!resp.ok) {
                toast.error(t("error-internal-server"));
                return;
            }
            await logout();
        } catch {
            toast.error(t("error-internal-server"));
        } finally {
            setIsTerminatingAll(false);
        }
    }

    function confirmTerminate(session: Session) {
        const isCurrent = session.id === currentSessionId;
        addModal((onClose) => (
            <ConfirmModal
                title={t("confirm-terminate-title")}
                description={isCurrent
                    ? t("confirm-terminate-current-description")
                    : t("confirm-terminate-description")
                }
                labelConfirm={t("confirm-terminate-label")}
                labelCancel={t("confirm-cancel-label")}
                onConfirm={() => {
                    onClose();
                    terminateSession(session.id);
                }}
                onClose={onClose}
            />
        ));
    }

    function confirmTerminateAll() {
        addModal((onClose) => (
            <ConfirmModal
                title={t("confirm-terminate-all-title")}
                description={t("confirm-terminate-all-description")}
                labelConfirm={t("confirm-terminate-label")}
                labelCancel={t("confirm-cancel-label")}
                onConfirm={() => {
                    onClose();
                    terminateAll();
                }}
                onClose={onClose}
            />
        ));
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <Spinner className="size-8 text-muted-foreground"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-destructive">
                <WarningCircleIcon className="size-16"/>
                <p className="text-sm">{t("error-load")}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <span className="text-base text-muted-foreground">
                    {t("section-title")}
                </span>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={confirmTerminateAll}
                    disabled={isTerminatingAll || sessions.length === 0}
                >
                    {isTerminatingAll
                        ? <Spinner data-icon="inline-start"/>
                        : <SignOutIcon data-icon="inline-start"/>
                    }
                    {t("label-terminate-all")}
                </Button>
            </div>

            <Separator/>

            <div className="flex flex-col gap-2">
                {sessions.map((session) => {
                    const isCurrent = session.id === currentSessionId;
                    const isTerminating = terminatingId === session.id;
                    const createdAt = new Date(session.createdAt);
                    const lastActiveAt = new Date(session.lastActiveAt);

                    return <Card key={session.id} className="!p-2">
                        <CardContent className="flex !p-0 gap-3">
                            <div className="flex flex-col gap-1 grow-1">
                                <DeviceInfo
                                    data={session.deviceInfo}
                                    ip={session.ipAddress}
                                    iconClassName="size-10"
                                    deviceClassName="text-base"
                                    appClassName="text-sm"
                                />
                                {isCurrent && (
                                    <Badge>
                                        {t("badge-current")}
                                    </Badge>
                                )}
                                <div className="flex gap-1 items-center text-sm text-muted-foreground">
                                    {t("label-created")}{" "}
                                    {createdAt.toLocaleString()}
                                    <ArrowRightIcon/>
                                    {t("label-last-active")}{" "}
                                    {lastActiveAt.toLocaleString()}
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => confirmTerminate(session)}
                                disabled={isTerminating}
                                title={t("label-terminate")}
                            >
                                {isTerminating
                                    ? <Spinner/>
                                    : <SignOutIcon/>
                                }
                            </Button>
                        </CardContent>
                    </Card>
                })}
            </div>
        </div>
    );
}