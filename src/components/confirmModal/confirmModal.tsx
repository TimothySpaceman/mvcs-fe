import {Button} from "@/components/ui/button";

type Props = {
    title: string;
    description: string;
    labelConfirm: string;
    labelCancel: string;
    onConfirm: () => void;
    onClose: () => void;
};

export default function ConfirmModal({title, description, labelConfirm, labelCancel, onConfirm, onClose}: Props) {
    return (
        <div className="space-y-4 w-80">
            <h2 className="font-bold text-xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex gap-2 justify-end">
                <Button onClick={onConfirm}>
                    {labelConfirm}
                </Button>
                <Button onClick={onClose} variant="secondary">
                    {labelCancel}
                </Button>
            </div>
        </div>
    );
}