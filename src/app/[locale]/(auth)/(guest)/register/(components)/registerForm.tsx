"use client";

import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {ChangeEvent, SubmitEvent, useState} from "react";
import {Button} from "@/components/ui/button";
import {api} from "@/lib/api";
import {useUser} from "@/components/userProvider/userProvider";
import {Spinner} from "@/components/ui/spinner";
import {Link, useRouter} from "@/i18n/navigation";
import {useQueryState} from "nuqs";
import {toast} from "sonner";

type Errors = {
    username?: string,
    displayName?: string,
    email?: string,
    plainPassword?: string,
    confirmPassword?: string,
}

type RegisterSchema = {
    username: string,
    displayName: string,
    email: string,
    plainPassword: string,
    confirmPassword: string,
}

function validateRedirect(redirectTo: string | null, fallback: string) {
    if (!redirectTo) return fallback;

    const decodedPath = decodeURIComponent(redirectTo);
    const isSafe = decodedPath.startsWith("/") && !decodedPath.startsWith("//") && !decodedPath.startsWith("/\\");
    return isSafe ? redirectTo : fallback;
}

export default function RegisterForm() {
    const t = useTranslations("Register.form");
    const {refreshUserData} = useUser();
    const router = useRouter();

    const [redirectTo] = useQueryState("redirectTo");

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<RegisterSchema>({
        username: "",
        displayName: "",
        email: "",
        plainPassword: "",
        confirmPassword: "",
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
        setErrors(prev => ({...prev, [name]: undefined}));
    }

    async function register() {
        const resp = await api.fetch("/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: form.username,
                displayName: form.displayName,
                email: form.email,
                plainPassword: form.plainPassword,
            })
        });

        if (!resp.ok) {
            toast.error(t(resp.status === 409 ? "error-already-exists" : "error-internal-server"));
            return false;
        }

        return true;
    }

    async function login() {
        const resp = await api.fetch("/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                emailOrUsername: form.email,
                password: form.plainPassword,
            })
        });

        if (!resp.ok) {
            toast.error(t("error-internal-server"));
            return false;
        }

        return true;
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (form.plainPassword !== form.confirmPassword) {
            setErrors({confirmPassword: "error-passwords-mismatch"});
            return;
        }

        try {
            setIsLoading(true);

            if (!await register()) return;
            if (!await login()) return;

            await refreshUserData();
            router.push(validateRedirect(redirectTo, "/"));
            router.refresh();
        } catch (e) {
            toast.error(t("error-internal-server"));
        } finally {
            setIsLoading(false);
        }
    }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
            <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="register-username-input">
                    {t("label-username")}
                </FieldLabel>
                <Input
                    id="register-username-input"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.username}
                />
                {errors.username && <FieldError className="text-destructive">
                    {t(errors.username)}
                </FieldError>}
            </Field>
            <Field data-invalid={!!errors.displayName}>
                <FieldLabel htmlFor="register-display-name-input">
                    {t("label-display-name")}
                </FieldLabel>
                <Input
                    id="register-display-name-input"
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.displayName}
                />
                {errors.displayName && <FieldError className="text-destructive">
                    {t(errors.displayName)}
                </FieldError>}
            </Field>
            <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="register-email-input">
                    {t("label-email")}
                </FieldLabel>
                <Input
                    id="register-email-input"
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                />
                {errors.email && <FieldError className="text-destructive">
                    {t(errors.email)}
                </FieldError>}
            </Field>
            <Field data-invalid={!!errors.plainPassword}>
                <FieldLabel htmlFor="register-password-input">
                    {t("label-password")}
                </FieldLabel>
                <Input
                    id="register-password-input"
                    type="password"
                    name="plainPassword"
                    value={form.plainPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.plainPassword}
                />
                {errors.plainPassword && <FieldError className="text-destructive">
                    {t(errors.plainPassword)}
                </FieldError>}
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="register-confirm-password-input">
                    {t("label-confirm-password")}
                </FieldLabel>
                <Input
                    id="register-confirm-password-input"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <FieldError className="text-destructive">
                    {t(errors.confirmPassword)}
                </FieldError>}
            </Field>
        </FieldGroup>
        <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner data-icon="inline-start"/>} {t("label-submit")}
            </Button>
        </Field>
        <p className="text-center">
            {t("message-login")}
            <Link
                className="font-bold hover:underline"
                href={redirectTo ? `/login?redirectTo=${redirectTo}` : "/login"}
            >
                {t("link-login")}
            </Link>
        </p>
    </form>
}