"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {User} from "@/lib/auth/types";
import {api} from "@/lib/api";

const USER_CACHE_KEY = "user-cached";

type UserContext = {
    user: User | undefined;
    isLoading: boolean;
    setUser: (user: User | undefined) => void;
    refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContext | undefined>(undefined);

type UserProviderProps = {
    initialUser?: User;
    children: React.ReactNode;
};

export function UserProvider({initialUser, children}: UserProviderProps) {
    console.log("Rendering provider")

    const [user, setUser] = useState<User | undefined>(initialUser);
    const [isLoading, setIsLoading] = useState(true);

    const setUserAndCache = useCallback((newUser: User | undefined) => {
        setUser(newUser);
        if (!!newUser) {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
        } else {
            localStorage.removeItem(USER_CACHE_KEY);
        }
    }, [setUser]);

    const refreshUserData = useCallback(async () => {
        try {
            const response = await api.fetch("/auth/me", {auth: true});
            setUserAndCache(response.ok ? await response.json() as User : undefined);
        } catch (e) {
            console.error("Error fetching /me", e);
            setUserAndCache(undefined);
        } finally {
            setIsLoading(false);
        }
    }, [setUserAndCache, setIsLoading]);

    useEffect(() => {
        console.log("Restoring cache...");
        try {
            const cached = localStorage.getItem(USER_CACHE_KEY);
            if (!!cached) setUser(JSON.parse(cached));
        } catch (e) {
            console.error("Error restoring cache", e);
        }
    }, []);

    useEffect(() => {
        refreshUserData();
    }, [refreshUserData])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") refreshUserData();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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