"use client";

import useSWR from "swr";
import {useTranslations} from "next-intl";
import {Spinner} from "@/components/ui/spinner";
import {ListMagnifyingGlassIcon, WarningCircleIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";
import {useState} from "react";
import {parseAsString, useQueryState} from "nuqs";
import {Ref, SnapshotMetadata} from "@/lib/entities/project";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    formatValue,
    getKeyDef,
    getNamespace,
    SEMANTIC_GROUP_ORDER,
    SemanticGroup,
} from "@/components/snapshotMetadataView/metadataConfig";

const GroupModes = {
    namespace: "namespace",
    semantic: "semantic",
} as const;
type GroupMode = keyof typeof GroupModes;

type MetadataRow = {
    key: string;
    labelKey: string;
    value: string;
};

type MetadataGroup = {
    title: string;
    rows: MetadataRow[];
};

function groupByNamespace(data: Record<string, string[]>): MetadataGroup[] {
    const groups: Map<string, MetadataRow[]> = new Map();

    for (const [key, values] of Object.entries(data)) {
        const ns = getNamespace(key);
        if (!groups.has(ns)) groups.set(ns, []);
        groups.get(ns)!.push({
            key,
            labelKey: getKeyDef(key).labelKey,
            value: formatValue(key, values),
        });
    }

    return Array.from(groups.entries()).map(([ns, rows]) => ({title: ns, rows}));
}

function groupBySemantic(data: Record<string, string[]>): MetadataGroup[] {
    const groups: Map<SemanticGroup, MetadataRow[]> = new Map();

    for (const [key, values] of Object.entries(data)) {
        const def = getKeyDef(key);
        const g = def.semanticGroup;
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g)!.push({
            key,
            labelKey: def.labelKey,
            value: formatValue(key, values),
        });
    }

    return SEMANTIC_GROUP_ORDER
        .filter(g => groups.has(g))
        .map(g => ({title: g, rows: groups.get(g)!}));
}

type Props = {
    projectId: string;
    className?: string;
};

export default function SnapshotMetadataView({projectId, className}: Props) {
    const t = useTranslations("ProjectPage.metadata");

    const [commitId] = useQueryState("commitId", parseAsString);
    const [refName] = useQueryState("refName", parseAsString);

    const {data: refs} = useSWR<Ref[]>(`/projects/${projectId}/vcs/refs`);
    const refCommitId = refName ? (refs?.find(r => r.name === refName)?.commitId ?? null) : null;

    const resolvedCommitId = commitId ?? refCommitId;

    const [mode, setMode] = useState<GroupMode>(GroupModes.semantic);

    const {data, isLoading, error} = useSWR<SnapshotMetadata>(
        resolvedCommitId
            ? `/projects/${projectId}/vcs/commits/${resolvedCommitId}/metadata`
            : null
    );

    if (!resolvedCommitId) return null;

    if (isLoading) return (
        <div className={twMerge(
            "flex flex-col items-center justify-center gap-2 text-muted-foreground py-2 border border-border",
            className
        )}>
            <Spinner className="size-4"/>
            <span className="text-s text-centerm">{t("label-loading")}</span>
        </div>
    );

    if (data === null || error?.isNotFound || (data && Object.keys(data.data).length === 0)) return (
        <div className={twMerge(
            "flex flex-col items-center justify-center gap-2 text-muted-foreground py-2 border border-border",
            className
        )}>
            <ListMagnifyingGlassIcon className="size-8"/>
            <span className="text-sm text-center">{t("label-empty")}</span>
        </div>
    );

    if (error) return (
        <div className={twMerge(
            "flex flex-col items-center justify-center gap-2 text-destructive py-2 border border-border",
            className
        )}>
            <WarningCircleIcon className="size-8"/>
            <span className="text-sm text-center">{t("error-failed")}</span>
        </div>
    );

    const groups = mode === GroupModes.namespace ? groupByNamespace(data!.data) : groupBySemantic(data!.data);

    return (
        <div className={twMerge("flex flex-col gap-1 border border-border", className)}>
            <div className="p-1 pl-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t("title")}</span>
                <Select value={mode} onValueChange={(v) => setMode(v as GroupMode)}>
                    <SelectTrigger size="sm" className="self-end">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={GroupModes.namespace}>{t("mode-namespace")}</SelectItem>
                        <SelectItem value={GroupModes.semantic}>{t("mode-semantic")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                {groups.map((group) => (
                    <div key={group.title} className="px-1.5 py-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                            {t.has(`group-${group.title}`) ? t(`group-${group.title}`) : group.title}
                        </p>
                        <table className="w-full text-xs">
                            <tbody>
                            {group.rows.map((row) => (
                                <tr key={row.key} className="border-b border-border/50 last:border-0">
                                    <td className="py-0.5 pr-4 font-normal text-muted-foreground w-1/2 align-top">
                                        {t.has(row.labelKey) ? t(row.labelKey) : row.labelKey}
                                    </td>
                                    <td className="py-0.5 font-mono align-top break-all">
                                        {row.value}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}