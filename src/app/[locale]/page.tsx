"use client"

import {useUser} from "@/components/userProvider/userProvider";
import {api} from "@/lib/api";

export default function Home() {
    const {user, setUser, refreshUserData} = useUser();
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <pre>
                {JSON.stringify(user, null, 2)}
            </pre>
            <button onClick={() => {
                api.fetch("/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        emailOrUsername: "test",
                        password: "Pass1234",
                    })
                }).then(res => {
                    if (res.ok) refreshUserData();
                })
            }}>Login
            </button>
            <button onClick={() => {
                api.fetch("/auth/logout", {method: "POST"}).then(res => {
                    if (res.ok) setUser(undefined);
                })
            }}>Logout
            </button>
        </div>
    );
}
