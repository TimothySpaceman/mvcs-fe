"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {User, UserMetadata} from "@/lib/auth/types";
import {api} from "@/lib/api";
import {USER_METADATA_COOKIE_NAME} from "@/lib/auth";

type UserContext = {
    user: UserMetadata | undefined;
    isLoading: boolean;
    currentSessionId: string | undefined;
    setUser: (user: UserMetadata | undefined) => void;
    refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContext | undefined>(undefined);

type UserProviderProps = {
    initialUser?: UserMetadata;
    children: React.ReactNode;
};

function readSessionIdFromCookie(): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${USER_METADATA_COOKIE_NAME}=`));
    if (!match) return undefined;
    try {
        const raw = match.split("=").slice(1).join("=");
        return JSON.parse(decodeURIComponent(raw))?.sessionId as string | undefined;
    } catch {
        return undefined;
    }
}

export function UserProvider({initialUser, children}: UserProviderProps) {
    const [user, setUser] = useState<UserMetadata | undefined>(initialUser);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
        readSessionIdFromCookie
    );

    const setUserAndCache = useCallback((newUser: UserMetadata | undefined) => {
        setUser(newUser);
        if (!newUser) {
            setCurrentSessionId(undefined);
            cookieStore.delete(USER_METADATA_COOKIE_NAME).catch(
                () => console.error("Failed to clean auth metadata cookies")
            );
        }
    }, [setUser]);

    const refreshUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.fetch("/auth/me", {auth: true});
            setUserAndCache(response.ok ? await response.json() as User : undefined);
            setCurrentSessionId(readSessionIdFromCookie());
        } catch (e) {
            console.error("Error fetching /me", e);
        } finally {
            setIsLoading(false);
        }
    }, [setUserAndCache, setIsLoading]);

    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);

    const contextValue = useMemo(
        () => ({
            user,
            isLoading,
            currentSessionId,
            setUser: setUserAndCache,
            refreshUserData
        }),
        [user, isLoading, currentSessionId, setUserAndCache, refreshUserData]
    );

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be inside UserProvider");
    return ctx;
}