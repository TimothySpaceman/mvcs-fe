"use client";

import {Field, FieldDescription, FieldGroup} from "@/components/ui/field";
import {useTranslations} from "next-intl";
import {SubmitEvent, useEffect, useLayoutEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useUser} from "@/components/userProvider/userProvider";
import {Spinner} from "@/components/ui/spinner";
import {useRouter} from "@/i18n/navigation";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import {DeviceInfo} from "@/lib/auth/types";
import {Item} from "@/components/ui/item";
import {api} from "@/lib/api";

type Errors = {
    code?: string,
    general?: string
}

type Props = {
    codeAutofill?: string
}

// TODO: Prettify device info
export default function ConfirmForm({codeAutofill = ""}: Props) {
    const t = useTranslations("ConfirmDevice.form");
    const {user} = useUser();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [code, setCode] = useState(codeAutofill);
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>();

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setErrors({});
            setIsLoading(true);
            const params = new URLSearchParams({userCode: code});
            const resp = await api.fetch(`/auth/device/confirm?${params}`, {
                method: "POST",
                auth: true
            });

            if (resp.ok) {
                router.push("/confirm-device/success");
                router.refresh();
            } else {
                setErrors({general: resp.status == 404 ? "error-invalid-code" : "error-internal-server"})
            }
        } catch (e) {
            setErrors({general: "error-internal-server"});
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchDeviceInfo() {
        try {
            setErrors({});
            setIsLoading(true);
            const params = new URLSearchParams({userCode: code});
            const resp = await api.fetch(`/auth/device/info?${params}`, {auth: true});

            if (resp.ok) {
                setDeviceInfo(await resp.json());
            } else {
                setErrors({general: resp.status == 404 ? "error-invalid-code" : "error-internal-server"})
            }
        } catch (e) {
            setErrors({general: "error-internal-server"});
        } finally {
            setIsLoading(false);
        }
    }

    useLayoutEffect(() => {
        if (user) return;
        const redirectTo = `/confirm-device?${new URLSearchParams({code: code})}`;
        const params = new URLSearchParams({redirectTo});
        router.push(`/login?${params}`);
        router.refresh();
    })

    useEffect(() => {
        if (code.length < 6) {
            setDeviceInfo(undefined);
            return;
        }

        fetchDeviceInfo();
    }, [code])

    return <>
        <p className="mb-2 text-center">{t("description")}</p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
            <FieldGroup>
                <Field data-invalid={!!errors.code}>
                    <div className="flex justify-center">
                        <InputOTP
                            id="confirm-code-input"
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                            value={code}
                            onChange={setCode}
                            required
                            disabled={isLoading}
                            aria-invalid={!!errors.code}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot className="text-xl" index={0}/>
                                <InputOTPSlot className="text-xl" index={1}/>
                                <InputOTPSlot className="text-xl" index={2}/>
                                <InputOTPSlot className="text-xl" index={3}/>
                                <InputOTPSlot className="text-xl" index={4}/>
                                <InputOTPSlot className="text-xl" index={5}/>
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    {errors.code && <FieldDescription className="text-destructive">
                        {t(errors.code)}
                    </FieldDescription>}
                </Field>
            </FieldGroup>

            {deviceInfo && <Item>
                <pre>
                    {JSON.stringify(deviceInfo, null, 2)}
                </pre>
            </Item>}

            <Field>
                {errors.general && <FieldDescription className="text-destructive">
                    {t(errors.general)}
                </FieldDescription>}
                <Button type="submit" className="w-max! mx-auto px-8" disabled={isLoading || !deviceInfo}>
                    {isLoading && <Spinner/>} {t("label-confirm")}
                </Button>
            </Field>
        </form>
    </>
}