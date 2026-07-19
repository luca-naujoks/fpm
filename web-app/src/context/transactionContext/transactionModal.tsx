import {type ReactNode, useState} from "react";
import type {ITransaction} from "../../interfaces.ts";
import {TransactionContext} from "./useTransactionModal.ts";


export const TransactionProvider = ({children}: { children: ReactNode }): ReactNode => {
    const emptyTransaction: ITransaction = {
        id: 0,
        project_id: 0,
        description: "",
        amount: 0,
        date: new Date()
    }
    const [transactions, setTransactions] = useState<ITransaction[]>([])
    const [transactionDefault, setTransactionDefaults] = useState<ITransaction>(emptyTransaction)
    const [transactionModalOpen, setTransactionModalOpen] = useState<boolean>(false)

    async function fetchTransactions(projectId: number): Promise<void> {
        const response = await fetch(`/api/transactions?projectId=${projectId}`, {method: "GET"})
        const data: ITransaction[] = await response.json()
        setTransactions(data)
    }

    function openTransactionModal(transaction: ITransaction) {
        setTransactionDefaults(transaction)
        setTransactionModalOpen(true)
    }

    function closeTransactionModal() {
        setTransactionDefaults(emptyTransaction)
        setTransactionModalOpen(false)
    }

    return (
        <TransactionContext
            value={{
                transactions: transactions,
                fetchTransactions: fetchTransactions,

                transactionModalOpen: transactionModalOpen,
                transactionDefaults: transactionDefault,
                openTransactionModal: openTransactionModal,
                closeTransactionModal: closeTransactionModal
            }}>{children}</TransactionContext>
    )
}