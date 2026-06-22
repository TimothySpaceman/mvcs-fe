"use client"

import {useModal} from "@/components/modal/modalProvider";
import Modal from "@/components/modal/modal";

export default function ModalContainer() {
    const {modals} = useModal();

    return <>
        {modals.map(modal => <Modal config={modal} key={`modal-${modal.id}`}/>)}
    </>
}