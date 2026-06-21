import {DownloadSimpleIcon, FileIcon, MusicNotesIcon} from "@phosphor-icons/react";
import {ReleaseFile} from "@/lib/entities/project";
import {twMerge} from "tailwind-merge";
import Player from "@/components/player/player";
import {isAudioFile} from "@/components/player/config";

type Props = {
    file: ReleaseFile;
    projectId: string;
}

export default function ReleaseFileRow({file, projectId}: Props) {
    const host = process.env.NEXT_PUBLIC_API_HOST ?? "";
    const downloadUrl = `${host}/projects/${projectId}/releases/files/${file.id}?fileName=${file.fileName}`;

    const isAudio = isAudioFile(file.fileName);

    return (
        <div
            className={twMerge(
                "group/file-row flex items-center gap-2 py-1 pl-2 text-xs",
                "text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors duration-100"
            )}
        >
            {isAudio
                ? <MusicNotesIcon className="size-3.5 shrink-0 text-muted-foreground"/>
                : <FileIcon className="size-3.5 shrink-0 text-muted-foreground"/>
            }
            <span
                className={twMerge("truncate", isAudio ? "w-50 shrink-0" : "flex-1")}
                title={file.fileName}
            >
                {file.fileName}
            </span>

            {isAudio && (
                <Player src={downloadUrl} className="flex-1 min-w-0"/>
            )}

            <a
                href={downloadUrl}
                download={file.fileName}
                title={file.fileName}
                className={twMerge(
                    "opacity-0 group-hover/file-row:opacity-100 transition-opacity duration-100 mr-2 ml-auto",
                    "inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <DownloadSimpleIcon className="size-3.5"/>
            </a>
        </div>
    );
}