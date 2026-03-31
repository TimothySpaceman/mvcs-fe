"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {User} from "@/lib/auth/types";
import {api} from "@/lib/api";

type UserContext = {
    user: User | undefined;
    setUser: (user: User | undefined) => void;
    refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContext | undefined>(undefined);

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be inside UserProvider");
    return ctx;
}

type UserProviderProps = {
    initialUser?: User;
    children: React.ReactNode;
};

export function UserProvider({initialUser, children}: UserProviderProps) {
    const [user, setUser] = useState<User | undefined>(initialUser);

    const refreshUserData = useCallback(async () => {
        try {
            const response = await api.fetch("/auth/me", {auth: true});
            setUser(response.ok ? await response.json() as User : undefined);
        } catch {
            setUser(undefined);
        }
    }, []);

    const contextValue = useMemo(
        () => ({
            user,
            setUser,
            refreshUserData
        }),
        [user, refreshUserData]
    );

    useEffect(() => {
        refreshUserData();
    }, [])

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}