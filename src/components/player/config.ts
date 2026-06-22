const AUDIO_EXTENSIONS = new Set([
    "mp3",
    "wav",
    "flac",
    "ogg",
    "oga",
    "opus",
    "m4a",
    "aac",
    "aiff",
    "aif",
    "wma",
    "weba",
]);

export function isAudioFile(fileName: string): boolean {
    const ext = fileName.split(".").at(-1)?.toLowerCase();
    return !!ext && AUDIO_EXTENSIONS.has(ext);
}