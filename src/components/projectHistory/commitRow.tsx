import {CommitInfo} from "@/lib/entities/project";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Link} from "@/i18n/navigation";
import CommitAuthor from "@/components/projectHistory/commitAuthor";

export default function CommitRow({commit}: { commit: CommitInfo }) {
    const date = new Date(commit.createdAt);
    const day = date.toLocaleDateString("uk-UA", {
        day: "numeric", month: "short", year: "numeric",
    });
    const dayTime = date.toLocaleString()

    return (
        <Card className="!p-2">
            <CardHeader className="!p-0">
                <CardTitle className="truncate">{commit.message}</CardTitle>
                <CardAction>
                    <Link
                        href={`?commitId=${commit.id}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        {commit.id.slice(0, 8)}
                    </Link>
                </CardAction>
                <CardDescription className="flex items-center gap-1">
                    <CommitAuthor author={commit.author}/>
                    <span
                        className="text-muted-foreground/60 shrink-0"
                        title={dayTime}
                    >
                        {day}
                    </span>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}