import './modals.css'
import {type ReactNode, useEffect, useState} from "react";
import type {ITransaction} from "../../interfaces.ts";
import {ModalWrapper} from "./wrapper.tsx";
import {useTransactionContext} from "../../context/transactionContext/useTransactionModal.ts";
import {CloseButton} from "../CloseButton.tsx";

export function TransactionModal(): ReactNode {
    const {
        closeTransactionModal,
        fetchTransactions,
        transactionDefaults,
        transactionModalOpen
    } = useTransactionContext()
    const updateModeActive: boolean = transactionDefaults.id != 0

    const [description, setDescription] = useState<string>("")
    const [date, setDate] = useState<Date>(new Date())
    const [amount, setAmount] = useState<string>("")
    const amountAsNumber: number = Number(amount)

    const [error, setError] = useState<string>("")

    const sameDate: boolean = new Date(transactionDefaults.date).setHours(0, 0, 0, 0) == new Date(date).setHours(0, 0, 0, 0)
    const didValueChangedToDefaultState: boolean = transactionDefaults.description == description && transactionDefaults.amount == amountAsNumber && sameDate


    async function createTransaction() {
        console.log(date)
        console.log(new Date(date))
        const transaction: ITransaction = {
            id: transactionDefaults.id,
            project_id: transactionDefaults.project_id,
            description: description,
            amount: amountAsNumber,
            date: new Date(date),
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
            setDate(transactionDefaults.date)
            setAmount(transactionDefaults.amount.toString())
            setError("")
        }
    }, [transactionModalOpen, transactionDefaults]);

    return (
        <ModalWrapper modalOpen={transactionModalOpen} closeModal={closeTransactionModal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <div className={"w-full flex justify-between items-start"}>
                <h1 className={"modalHeading"}>{updateModeActive ? "Update Transaction" : "Add Transaction"}</h1>
                <CloseButton onClick={closeTransactionModal}/>
            </div>
            <label htmlFor="">Description</label>
            <input type="text" placeholder={"Bluray, Special Funds..."} value={description}
                   onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Amount</label>
            <input type="number" value={amount}
                   onChange={(e) => setAmount(e.target.value)}/>
            <label htmlFor="">Date</label>
            <input type="date" value={new Date(date).toISOString().slice(0, 10)}
                   onChange={(e) => setDate(new Date(e.target.value))}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={closeTransactionModal}>Cancel</button>
                <button className={"button"} onClick={() => createTransaction()}
                        disabled={updateModeActive ? didValueChangedToDefaultState : false}>{updateModeActive ? "Update Transaction" : "Add Transaction"}</button>
            </div>
        </ModalWrapper>
    )
}