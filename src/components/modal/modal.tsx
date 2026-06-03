import {ReactNode, useCallback} from "react";
import {useModal} from "@/components/modal/modalProvider";
import {Card, CardContent} from "@/components/ui/card";

export type ModalFactory = (onClose: () => void) => ReactNode;

export type ModalOptions = {
    id: string
    closeOnBlur?: boolean
    modalClassName?: string
}

export type ModalConfig = ModalOptions & {
    contentFactory: ModalFactory
}

type Props = {
    config: ModalConfig
}

export default function Modal({config}: Props) {
    const {removeModal} = useModal();

    const onClose = useCallback(() => {
        removeModal(config.id)
    }, [config.id, removeModal]);

    return <div
        onClick={config.closeOnBlur ? onClose : undefined}
        className="bg-neutral-950/70 h-screen w-screen fixed top-0 left-0 z-5000 p-2 flex items-center justify-center"
    >
        <Card
            className={config.modalClassName}
            onClick={(e) => e.stopPropagation()}
        >
            <CardContent>
                {config.contentFactory(onClose)}
            </CardContent>
        </Card>
    </div>
}