import type {ITransaction} from "../../interfaces.ts";
import {useTransactionContext} from "../../context/transactionContext/useTransactionModal.ts";

export interface IContextMenuProps {
    position: { x: number, y: number }
    open: boolean
    close: () => void
    transaction: ITransaction
}

export function ContextMenu({props}: { props: IContextMenuProps }) {
    const {openTransactionModal, fetchTransactions} = useTransactionContext()

    async function deleteTransaction() {
        const response = await fetch(`/api/transaction?transactionId=${props.transaction.id}`, {method: "DELETE"})
        if (!response.ok) {
            alert("failed to delete Transaction")
            return
        }
        fetchTransactions(props.transaction.project_id)
        props.close()
    }

    function editTransaction() {
        props.close()
        openTransactionModal(props.transaction)
    }

    return (
        <>
            <div className={props.open ? "absolute top-0 left-0 w-screen h-screen" : "hidden"}
                 onClick={() => props.close()}
                 onContextMenu={(e) => {
                     e.preventDefault();
                     props.close()
                 }}
            >
                <div
                    className={`flex flex-col w-fit h-fit bg-(--bg) p-1 gap-1 border-2 border-(--border) rounded-md overflow-hidden`}
                    style={{position: "absolute", top: props.position.y, left: props.position.x}}
                    onClick={(e) => e.stopPropagation()}>
                    <button className={"contextMenuButton"} onClick={() => editTransaction()}>Edit
                        Transaction
                    </button>
                    <button className={"contextMenuButtonDanger"} onClick={() => deleteTransaction()}>Delete Transaction
                    </button>
                </div>
            </div>
        </>
    )
}