"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {User, UserMetadata} from "@/lib/auth/types";
import {api} from "@/lib/api";
import {USER_METADATA_COOKIE_NAME} from "@/lib/auth";

type UserContext = {
    user: UserMetadata | undefined;
    isLoading: boolean;
    setUser: (user: UserMetadata | undefined) => void;
    refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContext | undefined>(undefined);

type UserProviderProps = {
    initialUser?: UserMetadata;
    children: React.ReactNode;
};

export function UserProvider({initialUser, children}: UserProviderProps) {
    const [user, setUser] = useState<UserMetadata | undefined>(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    const setUserAndCache = useCallback((newUser: UserMetadata | undefined) => {
        setUser(newUser);
        if (!newUser) {
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
            setUser: setUserAndCache,
            refreshUserData
        }),
        [user, isLoading, setUserAndCache, refreshUserData]
    );

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be inside UserProvider");
    return ctx;
}