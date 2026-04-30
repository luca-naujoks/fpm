import './modals.css'
import {type JSX, useEffect, useState} from "react";
import type {ITransaction} from "../../interfaces.ts";
import {ModalWrapper} from "./wrapper.tsx";
import {useTransactionContext} from "../../context/transactionContext/useTransactionModal.ts";

export function TransactionModal(): JSX.Element {
    const {
        closeTransactionModal,
        fetchTransactions,
        transactionDefaults,
        transactionModalOpen
    } = useTransactionContext()

    const [description, setDescription] = useState<string>("")
    const [date, setDate] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const amountAsNumber: number = Number(amount)

    const [error, setError] = useState<string>("")

    async function createTransaction() {
        const transaction: ITransaction = {
            id: transactionDefaults.id,
            project_id: transactionDefaults.project_id,
            description: description,
            amount: amountAsNumber,
            date: transactionDefaults.date,
        }

        const requestMethod: "POST" | "PUT" = transaction.id == 0 ? "POST" : "PUT"

        const response = await fetch("/api/transaction", {method: requestMethod, body: JSON.stringify(transaction)})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        fetchTransactions(transactionDefaults.project_id)
        closeTransactionModal()
    }

    useEffect(() => {
        if (transactionModalOpen && transactionDefaults) {
            setDescription(transactionDefaults.description)
            setDate(transactionDefaults.date.toString().split('T')[0])
            setAmount(transactionDefaults.amount.toString())
            setError("")
        }
    }, [transactionModalOpen, transactionDefaults]);

    return (
        <ModalWrapper modalOpen={transactionModalOpen} closeModal={closeTransactionModal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <div className={"w-full flex justify-between items-start"}>
                <h1 className={"modalHeading"}>Add Transaction</h1>
                <button className={"ghost-button"} onClick={closeTransactionModal}>x
                </button>
            </div>
            <label htmlFor="">Description</label>
            <input type="text" placeholder={"Bluray, Special Funds..."} value={description}
                   onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Amount</label>
            <input type="number" value={amount}
                   onChange={(e) => setAmount(e.target.value)}/>
            <label htmlFor="">Date</label>
            <input type="date" value={date}
                   onChange={(e) => {
                       setDate(e.target.value);
                   }}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={closeTransactionModal}>Cancel</button>
                <button className={"button"} onClick={() => createTransaction()}>Add Transaction</button>
            </div>
        </ModalWrapper>
    )
}