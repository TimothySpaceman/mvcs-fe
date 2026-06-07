import {CommitInfo} from "@/lib/entities/project";
import useSWR from "swr";
import {User} from "@/lib/auth/types";
import UserInfo from "@/components/userInfo";

// TODO: Replace with link to profile
export default function CommitAuthor({author}: { author: CommitInfo["author"] }) {
    const {data: user} = useSWR<User>(author.id ? `/users/${author.id}` : null);

    const displayName = user?.displayName;
    const nameLabel = displayName && displayName !== author.name
        ? `${displayName} (${author.name})`
        : (displayName ?? author.name);

    return <UserInfo
        avatarUrl={user?.avatar?.url}
        avatarSize="sm"
        label={nameLabel}
    />
}