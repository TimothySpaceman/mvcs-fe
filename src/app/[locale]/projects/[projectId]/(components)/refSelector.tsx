"use client";

import useSWR from "swr";
import {useQueryState, parseAsString} from "nuqs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Spinner} from "@/components/ui/spinner";
import {Ref} from "@/lib/entities/project";
import {useTranslations} from "next-intl";
import {useEffect} from "react";

type Props = {
    projectId: string;
    allowCommit?: boolean;
    defaultRef?: string;
    className?: string;
};

const COMMIT_PREFIX = "__commit__:";

export default function RefSelector({projectId, allowCommit = true, defaultRef, className}: Props) {
    const t = useTranslations("ProjectPage.refSelector");

    const [refName, setRefName] = useQueryState("refName", parseAsString);
    const [commitId, setCommitId] = useQueryState("commitId", parseAsString);

    const {data: refs, isLoading} = useSWR<Ref[]>(`/projects/${projectId}/vcs/refs`);

    useEffect(() => {
        if (refName || (allowCommit && commitId) || !defaultRef) return;
        setRefName(defaultRef);
    }, [defaultRef]);

    const value = commitId ? `${COMMIT_PREFIX}${commitId}` : (refName ?? "");

    async function handleChange(next: string) {
        if (next.startsWith(COMMIT_PREFIX)) {
            await setRefName(null);
            await setCommitId(next.slice(COMMIT_PREFIX.length));
        } else {
            await setCommitId(null);
            await setRefName(next);
        }
    }

    return (
        <Select value={value} onValueChange={handleChange} disabled={isLoading}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={t("placeholder-branch")}/>
                {isLoading && <Spinner className="size-4"/>}
            </SelectTrigger>
            <SelectContent>
                {commitId && (
                    <SelectItem value={`${COMMIT_PREFIX}${commitId}`}>
                        <span className="font-mono">{commitId.slice(0, 8)}</span>
                    </SelectItem>
                )}
                {refs?.map((ref) => (
                    <SelectItem key={ref.name} value={ref.name}>
                        {ref.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}