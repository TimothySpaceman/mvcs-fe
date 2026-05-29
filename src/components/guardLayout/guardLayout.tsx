"use client";

import {PropsWithChildren, useLayoutEffect} from "react";
import {useUser} from "@/components/userProvider/userProvider";
import {useRouter} from "@/i18n/navigation";
import {User} from "@/lib/auth/types";

type RuleTrigger = "unauthenticated" | "authenticated"

type Rule = {
    trigger: RuleTrigger
    redirectTo: string
}

type Props = PropsWithChildren & {
    rules: Rule[]
}

type TriggerHandlersMap = {
    [key in RuleTrigger]: (user?: User) => boolean;
};

const triggerHandlers: TriggerHandlersMap = {
    unauthenticated: (user) => !user,
    authenticated: (user) => !!user,
}

export default function GuardLayout({children, rules}: Props) {
    const {user, isLoading} = useUser();
    const router = useRouter();

    useLayoutEffect(() => {
        if (isLoading) return;
        for (const rule of rules) {
            if (triggerHandlers[rule.trigger](user)) {
                router.push(rule.redirectTo);
                router.refresh();
                return;
            }
        }
    }, [user, isLoading])

    return <>{children}</>
}