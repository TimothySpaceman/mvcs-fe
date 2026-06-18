"use client";

import {useEffect} from "react";
import Container from "@/components/container/container";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {ArrowClockwiseIcon, HouseIcon} from "@phosphor-icons/react";

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({error, reset}: Props) {
    const t = useTranslations("ErrorPage");

    useEffect(() => {
        console.error(error);
    }, [error]);

    return <Container rootClassName="flex flex-col flex-1" className="flex flex-col flex-1 items-center justify-center text-center gap-4">
        <span className="font-heading font-bold text-7xl text-muted-foreground select-none">500</span>
        <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">{t("title")}</h1>
            <p className="text-muted-foreground max-w-md">{t("description")}</p>
            {error.digest && (
                <span className="font-mono text-xs text-muted-foreground mt-1">{error.digest}</span>
            )}
        </div>
        <div className="flex gap-2">
            <Button onClick={reset}>
                <ArrowClockwiseIcon data-icon="inline-start"/>
                {t("label-retry")}
            </Button>
            <Button asChild variant="secondary">
                <Link href="/">
                    <HouseIcon data-icon="inline-start"/>
                    {t("label-home")}
                </Link>
            </Button>
        </div>
    </Container>
}