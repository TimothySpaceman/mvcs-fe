"use client";

import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {ChangeEvent, SubmitEvent, useState} from "react";
import {Button} from "@/components/ui/button";
import {api} from "@/lib/api";
import {useUser} from "@/components/userProvider/userProvider";
import {Spinner} from "@/components/ui/spinner";
import {useRouter} from "@/i18n/navigation";
import {useQueryState} from "nuqs";

type Errors = {
    email?: string,
    password?: string
    general?: string
}

type LoginSchema = {
    email: string,
    password: string,
}

function validateRedirect(redirectTo: string | null, fallback: string) {
    if (!redirectTo) return fallback;

    const decodedPath = decodeURIComponent(redirectTo);
    const isSafe = decodedPath.startsWith("/") && !decodedPath.startsWith("//") && !decodedPath.startsWith("/\\");
    return isSafe ? redirectTo : fallback;
}

export default function LoginForm() {
    const t = useTranslations("Login.form");
    const {refreshUserData} = useUser();
    const router = useRouter();

    const [redirectTo] = useQueryState("redirectTo");

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<LoginSchema>({
        email: "",
        password: "",
    })

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
        setErrors(prev => ({...prev, [name]: undefined}));
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.email || !form.password) {
            setErrors({
                email: form.email ? undefined : "error-email-required",
                password: form.password ? undefined : "error-password-required",
            });
            return;
        }

        try {
            setIsLoading(true)
            const loginResp = await api.fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailOrUsername: form.email,
                    password: form.password,
                })
            })

            if (loginResp.ok) {
                await refreshUserData();
                router.push(validateRedirect(redirectTo, "/"));
                router.refresh();
            } else {
                setErrors({
                    general: loginResp.status === 401 ? "error-wrong-credentials" : "error-internal-server"
                });
            }
        } catch (e) {
            setErrors({
                general: "error-internal-server"
            });
        } finally {
            setIsLoading(false)
        }
    }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
            <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="login-email-input">
                    {t("label-email")}
                </FieldLabel>
                <Input
                    id="login-email-input"
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                />
                {errors.email && <FieldDescription className="text-destructive">
                    {t(errors.email)}
                </FieldDescription>}
            </Field>
            <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="login-password-input">
                    {t("label-password")}
                </FieldLabel>
                <Input
                    id="login-password-input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                />
                {errors.password && <FieldDescription className="text-destructive">
                    {t(errors.password)}
                </FieldDescription>}
            </Field>
        </FieldGroup>
        <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner/>} {t("label-submit")}
            </Button>
            {errors.general && <FieldDescription className="text-destructive">
                {t(errors.general)}
            </FieldDescription>}
        </Field>
    </form>
}