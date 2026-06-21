"use client";

import {useState} from "react";
import useSWR, {useSWRConfig} from "swr";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
} from "@/components/ui/combobox";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Field, FieldLabel} from "@/components/ui/field";
import UserInfo from "@/components/userInfo/userInfo";
import {api} from "@/lib/api";
import {StorageAccessLevels, StorageMember} from "@/lib/entities/storage";
import {User} from "@/lib/auth/types";
import {useModal} from "@/components/modal/modalProvider";
import ConfirmModal from "@/components/confirmModal/confirmModal";

type Props = {
    storageId: string;
};

type RevokeLevel = "revoke";
const REVOKE_LEVEL: RevokeLevel = "revoke";

export default function StorageAccessEditor({storageId}: Props) {
    const t = useTranslations("StoragePage.access");
    const {mutate} = useSWRConfig();
    const {addModal} = useModal();

    const {data: members, isLoading: isMembersLoading} = useSWR<StorageMember[]>(
        `/storages/${storageId}/members`
    );

    const memberIds = members?.map(m => m.userId) ?? [];
    const bulkParams = memberIds.map(id => `ids=${id}`).join("&");
    const {data: memberUsers, isLoading: isUsersLoading} = useSWR<User[]>(
        memberIds.length > 0 ? `/users/bulk?${bulkParams}` : null
    );

    const {data: allUsers, isLoading: isAllUsersLoading} = useSWR<{ items: User[] }>(
        `/users?itemsPerPage=100`
    );

    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

    const pendingUser = pendingUsers[0] ?? null;

    const memberUserMap = new Map<string, User>(
        (memberUsers ?? []).map(u => [u.id, u])
    );

    const nonMemberUsers = (allUsers?.items ?? []).filter(
        u => !memberIds.includes(u.id)
    );

    function invalidateMembers() {
        mutate(`/storages/${storageId}/members`);
    }

    async function confirmRevoke(userId: string) {
        addModal((onClose) => (
            <ConfirmModal
                title={t("confirm-title")}
                description={t("confirm-description-revoke")}
                labelConfirm={t("confirm-label-confirm")}
                labelCancel={t("confirm-label-cancel")}
                onConfirm={() => {
                    onClose();
                    handleRevoke(userId);
                }}
                onClose={onClose}
            />
        ));
    }

    async function handleRevoke(userId: string) {
        setLoadingUserId(userId);
        try {
            const resp = await api.fetch(`/storages/${storageId}/access/${userId}`, {
                auth: true,
                method: "DELETE",
            });
            if (!resp.ok) {
                toast.error(t("error-failed"));
                return;
            }
            invalidateMembers();
            toast.success(t("toast-success"));
        } catch {
            toast.error(t("error-failed"));
        } finally {
            setLoadingUserId(null);
        }
    }

    async function handleAddUser() {
        if (!pendingUser) return;
        setLoadingUserId(pendingUser.id);
        try {
            const resp = await api.fetch(`/storages/${storageId}/access/${pendingUser.id}`, {
                auth: true,
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({userId: pendingUser.id, accessType: StorageAccessLevels.write}),
            });
            if (!resp.ok) {
                toast.error(t("error-failed"));
                return;
            }
            setPendingUsers([]);
            invalidateMembers();
            toast.success(t("toast-success"));
        } catch {
            toast.error(t("error-failed"));
        } finally {
            setLoadingUserId(null);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {isMembersLoading || isUsersLoading ? (
                <div className="flex items-center gap-2 py-2">
                    <Spinner className="size-4"/>
                    <span className="text-xs text-muted-foreground">{t("label-loading")}</span>
                </div>
            ) : (
                <>
                    <div className="flex items-end gap-2">
                        <Field className="flex-1 min-w-0">
                            <FieldLabel>
                                {t("label-add-user")}
                                {isAllUsersLoading && <Spinner data-icon="inline-end"/>}
                            </FieldLabel>
                            <Combobox
                                items={nonMemberUsers}
                                itemToStringValue={(u) => u.displayName}
                                multiple
                                value={pendingUsers}
                                onValueChange={(value) => setPendingUsers(value.slice(-1))}
                                disabled={isAllUsersLoading || !!loadingUserId}
                            >
                                <ComboboxChips>
                                    <ComboboxValue>
                                        {pendingUsers.map(u => (
                                            <ComboboxChip key={u.id}>{u.displayName}</ComboboxChip>
                                        ))}
                                    </ComboboxValue>
                                    <ComboboxChipsInput
                                        placeholder={pendingUser ? "" : t("placeholder-search-user")}
                                    />
                                </ComboboxChips>
                                <ComboboxContent>
                                    <ComboboxEmpty>{t("label-no-users")}</ComboboxEmpty>
                                    <ComboboxList>
                                        {(u) => (
                                            <ComboboxItem key={u.id} value={u}>
                                                {u.displayName}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </Field>

                        <Button
                            onClick={handleAddUser}
                            disabled={!pendingUser || !!loadingUserId}
                            className="shrink-0"
                        >
                            {loadingUserId === pendingUser?.id
                                ? <Spinner data-icon="inline-start"/>
                                : null
                            }
                            {t("label-add")}
                        </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                        {members?.map(member => {
                            const user = memberUserMap.get(member.userId);
                            const isOwner = member.accessLevel === StorageAccessLevels.owner;
                            const isUpdating = loadingUserId === member.userId;

                            return (
                                <div
                                    key={member.userId}
                                    className="flex items-center gap-2 py-1"
                                >
                                    <UserInfo
                                        avatarUrl={user?.avatar?.url}
                                        label={user?.displayName ?? member.userId}
                                        className="min-w-0 flex-1"
                                    />

                                    {isOwner ? (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {t("level-owner")}
                                        </span>
                                    ) : (
                                        <Select
                                            value={member.accessLevel}
                                            onValueChange={(v) => {
                                                if (v === REVOKE_LEVEL) confirmRevoke(member.userId);
                                            }}
                                            disabled={isUpdating || !!loadingUserId}
                                        >
                                            <SelectTrigger size="sm" className="w-30 shrink-0">
                                                {isUpdating
                                                    ? <Spinner className="size-3"/>
                                                    : <SelectValue/>
                                                }
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={StorageAccessLevels.write}>
                                                        {t("level-write")}
                                                    </SelectItem>
                                                    <SelectItem value={REVOKE_LEVEL}>
                                                        {t("level-revoke")}
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}