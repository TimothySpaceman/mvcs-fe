"use client";

import {useEffect, useRef, useState} from "react";
import {PlayIcon, StopIcon} from "@phosphor-icons/react";
import {twMerge} from "tailwind-merge";

type Props = {
    src: string;
    className?: string;
};

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return "0:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Player({src, className}: Props) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            audio.currentTime = 0;
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            audio.currentTime = 0;
            setCurrentTime(0);
            setIsPlaying(false);
        } else {
            void audio.play();
            setIsPlaying(true);
        }
    }

    function seekToClientX(clientX: number) {
        const audio = audioRef.current;
        const track = trackRef.current;
        if (!audio || !track || !Number.isFinite(duration) || duration === 0) return;

        const rect = track.getBoundingClientRect();
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        const time = ratio * duration;
        audio.currentTime = time;
        setCurrentTime(time);
    }

    function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekToClientX(e.clientX);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            seekToClientX(e.clientX);
        }
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={twMerge("flex items-center gap-2", className)}>
            <audio ref={audioRef} src={src} preload="metadata"/>

            <button
                type="button"
                onClick={togglePlay}
                className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                {isPlaying
                    ? <StopIcon className="size-4" weight="fill"/>
                    : <PlayIcon className="size-4" weight="fill"/>
                }
            </button>

            <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="group/track relative flex-1 h-3 flex items-center cursor-pointer touch-none"
            >
                <div className="relative w-full h-1 bg-border">
                    <div
                        className="absolute inset-y-0 left-0 bg-primary"
                        style={{width: `${progress}%`}}
                    />
                </div>
            </div>

            <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>
        </div>
    );
}