import {User} from "@/lib/auth/types";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {CalendarIcon, EnvelopeIcon, UserIcon} from "@phosphor-icons/react/ssr";
import {getTranslations} from "next-intl/server";
import {twMerge} from "tailwind-merge";

type Props = {
    user: User;
};

type InfoRowProps = {
    icon: React.ReactNode;
    value: string;
    className?: string;
};

function InfoRow({icon, value, className}: InfoRowProps) {
    return (
        <div className={twMerge("flex items-center gap-2 text-xs text-muted-foreground min-w-0", className)}>
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{value}</span>
        </div>
    );
}

export default async function ProfileUserCard({user}: Props) {
    const t = await getTranslations("ProfilePage.user");

    const fallback = user.displayName.trim().toUpperCase().at(0) ?? "?";
    const joinedDate = new Date(user.createdAt).toLocaleDateString();

    return (
        <Card className="!p-2">
            <CardContent className="!p-0 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar size="lg" className="!size-32">
                        <AvatarImage src={user.avatar?.url}/>
                        <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 w-full">
                        <p className="font-bold text-base truncate">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.username}</p>
                    </div>
                    {user.isEmailVerified && (
                        <Badge variant="secondary" className="text-xs">
                            {t("badge-verified")}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <InfoRow
                        icon={<EnvelopeIcon className="size-3.5"/>}
                        value={user.email}
                    />
                    <InfoRow
                        icon={<UserIcon className="size-3.5"/>}
                        value={`${user.username}`}
                    />
                    <InfoRow
                        icon={<CalendarIcon className="size-3.5"/>}
                        value={t("label-joined", {date: joinedDate})}
                    />
                </div>
            </CardContent>
        </Card>
    );
}