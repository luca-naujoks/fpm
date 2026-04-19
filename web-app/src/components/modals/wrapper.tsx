import type {JSX, ReactNode} from "react";


interface ModalWrapperProps {
    children: ReactNode
    modalOpen: boolean
    closeModal: () => void
}

export function ModalWrapper({children, modalOpen, closeModal}: ModalWrapperProps): JSX.Element {
    return (
        <div onClick={closeModal}
             className={modalOpen ? "flex items-center justify-center absolute top-0 left-0 w-screen h-screen  bg-(--code-bg)/50" : "hidden"}>
            <div className={"flex flex-col h-fit w-fit p-4 bg-(--bg) border-2 border-(--border) rounded-md"}
                 onClick={(event) => event.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}