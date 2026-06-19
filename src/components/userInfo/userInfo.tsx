import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {PropsWithChildren, ReactNode} from "react";
import {twMerge} from "tailwind-merge";

type NameComponentProps = PropsWithChildren & {
    className?: string;
}

type Props = {
    avatarUrl?: string;
    label: string;
    avatarSize?: "default" | "sm" | "lg";
    labelShown?: boolean;
    className?: string;
    labelClassName?: string;
    LabelComponent?: (props: NameComponentProps) => ReactNode | null;
}

export default function UserInfo(
    {
        avatarUrl,
        label,
        avatarSize,
        labelShown = true,
        className,
        labelClassName,
        LabelComponent = (props: NameComponentProps) => <span {...props}>{props.children}</span>,
    }: Props
) {
    const fallbackLabel = label.trim().toUpperCase().at(0)

    return (
        <div className={twMerge("flex items-center gap-1.5", className)}>
            <Avatar size={avatarSize}>
                <AvatarImage src={avatarUrl}/>
                <AvatarFallback>{fallbackLabel}</AvatarFallback>
            </Avatar>
            {labelShown && <LabelComponent className={twMerge("text-muted-foreground truncate", labelClassName)}>
                {label}
            </LabelComponent>}
        </div>
    );
}