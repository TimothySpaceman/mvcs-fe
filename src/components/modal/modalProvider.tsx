"use client";

import {createContext, ReactNode, useContext, useState} from "react";
import {ModalConfig, ModalFactory, ModalOptions} from "@/components/modal/modal";
import {v4 as uuidv4} from "uuid";

type ModalContext = {
    modals: ModalConfig[]
    addModal: (factory: ModalFactory, options?: Partial<ModalOptions>) => void
    removeModal: (id: string) => void
};

const ModalContext = createContext<ModalContext | undefined>(undefined);

type ModalProviderProps = {
    children: ReactNode
};

export function ModalProvider({children}: ModalProviderProps) {
    const [modals, setModals] = useState<ModalConfig[]>([]);

    function addModal(factory: ModalFactory, options?: Partial<ModalOptions>) {
        const modal = {
            ...options,
            id: options?.id ?? uuidv4(),
            closeOnBlur: options?.closeOnBlur ?? true,
            contentFactory: factory
        };
        setModals((prev) => [...prev, modal]);
    }

    function removeModal(id: string) {
        setModals((prev) => prev.filter((t) => t.id !== id));
    }

    return <ModalContext.Provider value={{modals, addModal, removeModal}}>{children}</ModalContext.Provider>;
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be inside ModalProvider");
    return ctx;
}