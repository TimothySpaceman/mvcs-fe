import {PropsWithChildren} from "react";

export default function Separator({children}: PropsWithChildren) {
    return <div className="min-h-3 ml-2 p-2 border-l-2 border-border text-muted-foreground">
        {children}
    </div>
}