import {createContext, useContext} from "react";
import type {ITransaction} from "../../interfaces.ts";

interface ITransactionContext {
    transactions: ITransaction[]
    fetchTransactions: (projectId: number) => void

    transactionDefaults: ITransaction
    transactionModalOpen: boolean
    openTransactionModal: (transactionDefaults: ITransaction) => void
    closeTransactionModal: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const TransactionContext = createContext<ITransactionContext>(null)
export const useTransactionContext: () => ITransactionContext = (): ITransactionContext => useContext(TransactionContext)