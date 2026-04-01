import {useTranslations} from "next-intl";
import {useUser} from "@/components/userProvider/userProvider";
import {Link, useRouter} from "@/i18n/navigation";
import {api} from "@/lib/api";
import {toast} from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {GearIcon, SignOutIcon, UserIcon} from "@phosphor-icons/react";

export default function UserMenu() {
    const t = useTranslations("Header.user-menu");
    const {user, setUser} = useUser();
    const router = useRouter();

    function handleLogout() {
        api.fetch("/auth/logout", {method: "POST"}).then(res => {
            if (res.ok) {
                setUser(undefined);
                router.push("/");
                router.refresh();
            } else {
                toast.error(t("error-logout-failed"), {position: "top-center"});
            }
        }).catch(() => toast.error(t("error-logout-failed"), {position: "top-center"}))
    }

    if (!user) return <></>;

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar size="lg">
                    <AvatarImage src={user.avatar?.url}/>
                    <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mx-2">
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserIcon/>
                        {t("label-profile")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <GearIcon/>
                        {t("label-settings")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                    <SignOutIcon/>
                    {t("label-logout")}
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}