export const SemanticGroups = {
    general: "general",
    daw: "daw",
    tempo: "tempo",
    tracks: "tracks",
    technical: "technical",
    other: "other"
} as const;
export type SemanticGroup = keyof typeof SemanticGroups;

const NAMESPACE_GENERAL = "general";

export type KeyDef = {
    labelKey: string;
    semanticGroup: SemanticGroup;
    formatValue?: (values: string[]) => string;
};

const withUnit = (unit: string) => (values: string[]) => values.map(v => `${v} ${unit}`).join(", ");

const registry: Record<string, KeyDef> = {
    "daw": {
        labelKey: "key-daw",
        semanticGroup: SemanticGroups.general,
    },
    "reaper.plugins": {
        labelKey: "key-reaper-plugins",
        semanticGroup: SemanticGroups.daw,
    },
    "reaper.version": {
        labelKey: "key-reaper-version",
        semanticGroup: SemanticGroups.technical,
    },
    "reaper.tempo_bpm": {
        labelKey: "key-reaper-tempo-bpm",
        semanticGroup: SemanticGroups.tempo,
        formatValue: withUnit("BPM"),
    },
    "reaper.sample_rate": {
        labelKey: "key-reaper-sample-rate",
        semanticGroup: SemanticGroups.technical,
        formatValue: withUnit("Hz"),
    },
    "reaper.track_count": {
        labelKey: "key-reaper-track-count",
        semanticGroup: SemanticGroups.tracks,
    },
    "reaper.content_types": {
        labelKey: "key-reaper-content-types",
        semanticGroup: SemanticGroups.tracks,
    },
    "reaper.project_files": {
        labelKey: "key-reaper-project-files",
        semanticGroup: SemanticGroups.daw,
    },
    "reaper.time_signature": {
        labelKey: "key-reaper-time-signature",
        semanticGroup: SemanticGroups.tempo,
    },
};

export const SEMANTIC_GROUP_ORDER: SemanticGroup[] = [
    SemanticGroups.general,
    SemanticGroups.tempo,
    SemanticGroups.tracks,
    SemanticGroups.daw,
    SemanticGroups.technical,
    SemanticGroups.other,
];

export function getKeyDef(key: string): KeyDef {
    return registry[key] ?? {
        labelKey: key,
        semanticGroup: SemanticGroups.other,
    };
}

export function getNamespace(key: string): string {
    const dot = key.indexOf(".");
    return dot === -1 ? NAMESPACE_GENERAL : key.slice(0, dot);
}

export function formatValue(key: string, values: string[]): string {
    const def = getKeyDef(key);
    if (def?.formatValue) return def.formatValue(values);
    return values.join(", ");
}