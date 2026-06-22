"use client";

import {useEffect} from "react";

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({error, reset}: Props) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="ua">
        <body style={{
            margin: 0,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#0a0a0a",
            color: "#fafafa",
        }}>
        <h1 style={{fontSize: "1.5rem", fontWeight: 700, margin: 0}}>
            Something went wrong
        </h1>
        <p style={{color: "#a1a1a1", margin: 0, maxWidth: "28rem"}}>
            Critical error occurred. Try reloading the page.
        </p>
        <button
            onClick={reset}
            style={{
                cursor: "pointer",
                borderRadius: "0.5rem",
                border: "none",
                padding: "0.5rem 1rem",
                fontWeight: 500,
                backgroundColor: "#fafafa",
                color: "#0a0a0a",
            }}
        >
            Reload
        </button>
        </body>
        </html>
    );
}