import Container from "@/components/container/container";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {HouseIcon} from "@phosphor-icons/react/ssr";

export default async function NotFound() {
    const t = await getTranslations("NotFoundPage");

    return <Container rootClassName="flex flex-col flex-1" className="flex flex-col flex-1 items-center justify-center text-center gap-4">
        <span className="font-heading font-bold text-7xl text-muted-foreground select-none">404</span>
        <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">{t("title")}</h1>
            <p className="text-muted-foreground max-w-md">{t("description")}</p>
        </div>
        <Button asChild>
            <Link href="/">
                <HouseIcon data-icon="inline-start"/>
                {t("label-home")}
            </Link>
        </Button>
    </Container>
}