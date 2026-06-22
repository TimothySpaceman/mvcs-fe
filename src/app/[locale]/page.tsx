import Container from "@/components/container/container";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import type {Metadata} from "next";
import {
    GitBranchIcon,
    CloudArrowUpIcon,
    DesktopIcon,
    FolderIcon,
    GitMergeIcon,
    MusicNotesIcon,
    UsersIcon,
    AppleLogoIcon
} from "@phosphor-icons/react/ssr";
import {Separator} from "@/components/ui/separator";
import {ReactNode} from "react";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("HomePage.meta");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Home() {
    const t = await getTranslations("HomePage");

    return (
        <div className="flex flex-col flex-1">
            <Container
                rootClassName="flex flex-col flex-1 items-center justify-center border-b py-16"
                className="flex flex-col items-center text-center gap-6"
            >
                <div className="flex flex-col gap-2">
                    <span className="font-heading font-bold text-7xl tracking-tight select-none">
                        MVCS
                    </span>
                    <p className="text-muted-foreground text-sm max-w-md">
                        {t("hero.tagline")}
                    </p>
                </div>
                <p className="text-base max-w-xl">
                    {t("hero.description")}
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Button asChild size="lg">
                        <Link href="/register">{t("hero.label-get-started")}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/projects">{t("hero.label-browse-projects")}</Link>
                    </Button>
                </div>
            </Container>

            <Container rootClassName="py-12 border-b" className="space-y-8">
                <h2 className="font-heading font-medium text-sm text-muted-foreground uppercase tracking-widest">
                    {t("features.heading")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-border bg-border">
                    <FeatureCard
                        icon={<GitBranchIcon className="size-5"/>}
                        title={t("features.branching.title")}
                        description={t("features.branching.description")}
                    />
                    <FeatureCard
                        icon={<GitMergeIcon className="size-5"/>}
                        title={t("features.merge-requests.title")}
                        description={t("features.merge-requests.description")}
                    />
                    <FeatureCard
                        icon={<MusicNotesIcon className="size-5"/>}
                        title={t("features.daw-metadata.title")}
                        description={t("features.daw-metadata.description")}
                    />
                    <FeatureCard
                        icon={<UsersIcon className="size-5"/>}
                        title={t("features.custom-storages.title")}
                        description={t("features.custom-storages.description")}
                    />
                    <FeatureCard
                        icon={<CloudArrowUpIcon className="size-5"/>}
                        title={t("features.resumable-uploads.title")}
                        description={t("features.resumable-uploads.description")}
                    />
                    <FeatureCard
                        icon={<FolderIcon className="size-5"/>}
                        title={t("features.file-tree.title")}
                        description={t("features.file-tree.description")}
                    />
                </div>
            </Container>

            <Container rootClassName="py-12 border-b" className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading font-medium text-sm text-muted-foreground uppercase tracking-widest">
                        {t("download.heading")}
                    </h2>
                    <p className="font-bold text-xl">{t("download.title")}</p>
                    <p className="text-muted-foreground max-w-lg">{t("download.description")}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button asChild variant="outline" size="lg">
                        <a href="/" download>
                            <DesktopIcon data-icon="inline-start"/>
                            {t("download.label-windows")}
                        </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <a href="/" download>
                            <AppleLogoIcon data-icon="inline-start"/>
                            {t("download.label-macos")}
                        </a>
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("download.note")}</p>
            </Container>

            <Container rootClassName="py-6" className="flex items-center justify-between gap-4 flex-wrap">
                <span className="font-heading font-bold text-sm select-none">MVCS</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Link href="/projects" className="hover:text-foreground transition-colors">
                        {t("footer.label-projects")}
                    </Link>
                    <Separator orientation="vertical" className="h-3"/>
                    <Link href="/login" className="hover:text-foreground transition-colors">
                        {t("footer.label-login")}
                    </Link>
                    <Separator orientation="vertical" className="h-3"/>
                    <Link href="/register" className="hover:text-foreground transition-colors">
                        {t("footer.label-register")}
                    </Link>
                </div>
            </Container>
        </div>
    );
}

type FeatureCardProps = {
    icon: ReactNode;
    title: string;
    description: string;
};

function FeatureCard({icon, title, description}: FeatureCardProps) {
    return (
        <div className="flex flex-col gap-2 bg-background p-5">
            <div className="flex gap-1 items-center">
                {icon}
                <span className="font-heading font-medium text-base">{title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}