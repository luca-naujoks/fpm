import type {ITransaction} from "../../interfaces.ts";
import {useTransactionContext} from "../../context/transactionModal/useTransactionModal.ts";

interface PContextMenuProps {
    position: { x: number, y: number }
    open: boolean
    close: () => void
    transaction: ITransaction
}

export function ContextMenu({position, open, close, transaction}: PContextMenuProps) {
    const {openTransactionModal, fetchTransactions} = useTransactionContext()

    async function deleteTransaction() {
        const response = await fetch(`/api/transaction?transactionId=${transaction.id}`, {method: "DELETE"})
        if (!response.ok) {
            alert("failed to delete Transaction")
            return
        }
        fetchTransactions(transaction.project_id)
        close()
    }

    return (
        <>
            <div className={open ? "absolute top-0 left-0 w-screen h-screen" : "hidden"}
                 onClick={() => close()}
                 onContextMenu={(e) => {
                     e.preventDefault();
                     close()
                 }}
            >
                <div
                    className={`flex flex-col w-fit h-fit bg-(--bg) p-1 gap-1 border-2 border-(--border) rounded-md overflow-hidden`}
                    style={{position: "absolute", top: position.y, left: position.x}}
                    onClick={(e) => e.stopPropagation()}>
                    <button className={"contextMenuButton"} onClick={() => openTransactionModal(transaction)}>Edit
                        Transaction
                    </button>
                    <button className={"contextMenuButtonDanger"} onClick={() => deleteTransaction()}>Delete Transaction
                    </button>
                </div>
            </div>
        </>
    )
}