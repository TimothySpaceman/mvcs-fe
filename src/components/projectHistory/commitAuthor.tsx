import {CommitInfo} from "@/lib/entities/project";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function CommitAuthor({author}: { author: CommitInfo["author"] }) {
    const {data: user} = useSWR<User>(author.id ? `/users/${author.id}` : null);

    const displayName = user?.displayName;
    const nameLabel = displayName && displayName !== author.name
        ? `${displayName} (${author.name})`
        : (displayName ?? author.name);

    return (
        <div className="flex items-center gap-1.5 min-w-0">
            <Avatar size="sm">
                <AvatarImage src={user?.avatar?.url}/>
                <AvatarFallback>{nameLabel.trim().toUpperCase().at(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate">{nameLabel}</span>
        </div>
    );
}