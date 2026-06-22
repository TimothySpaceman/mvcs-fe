import {PropsWithChildren} from "react";
import {twMerge} from "tailwind-merge";

type Props = PropsWithChildren & {
    rootClassName?: string;
    className?: string;
}

export default function Container({rootClassName, className, children}: Props) {
    return <div className={twMerge("p-4", rootClassName)}>
        <div className={twMerge("max-w-5xl mx-auto", className)}>
            {children}
        </div>
    </div>
}