import './modals.css'
import {type JSX, useState} from "react";
import type {IProject, ITransaction} from "../../interfaces.ts";
import {ModalWrapper} from "./wrapper.tsx";

export interface createTransactionProps {
    modalOpen: boolean,
    closeMoal: () => void,
    transactionRefetch: () => void,
    project: IProject,
}

export function CreateExpenseModal({props}: { props: createTransactionProps }): JSX.Element {
    const [description, setDescription] = useState<string>("")
    const [amount, setAmount] = useState<string>("-20")
    const amountAsNumber: number = Number(amount)

    const [error, setError] = useState<string>("")

    async function submitTransaction() {
        const expense: ITransaction = {
            id: 0,
            project_id: props.project.id,
            description: description,
            amount: amountAsNumber,
            date: new Date(),
        }
        const response = await fetch("/api/transaction", {method: "POST", body: JSON.stringify(expense)})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        props.closeMoal()
        props.transactionRefetch()
    }

    return (
        <ModalWrapper modalOpen={props.modalOpen} closeModal={props.closeMoal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <h1 className={"modalHeading"}>Add Expense</h1>
            <label htmlFor="">Description</label>
            <input type="text" placeholder={"Bluray"} onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Amount</label>
            <input type="number" max={0} value={amount} onChange={(e) => Number(e.target.value) <= 0 && setAmount(e.target.value)}/>
            <label htmlFor="">Date</label>
            <input type="date" onChange={(e) => setAmount(e.target.value)}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={() => props.closeMoal()}>Cancel</button>
                <button className={"button"} onClick={() => submitTransaction()}>Add Expense</button>
            </div>
        </ModalWrapper>
    )
}

export function CreateIncomeModal({props}: { props: createTransactionProps }): JSX.Element {
    const [description, setDescription] = useState<string>("")
    const [amount, setAmount] = useState<string>("20")
    const amountAsNumber: number = Number(amount)

    const [error, setError] = useState<string>("")

    async function submitIncome() {
        const income: ITransaction = {
            id: 0,
            project_id: props.project.id,
            description: description,
            amount: amountAsNumber,
            date: new Date(),
        }
        const response = await fetch("/api/transaction", {method: "POST", body: JSON.stringify(income)})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        props.closeMoal()
        props.transactionRefetch()
    }

    return (
        <ModalWrapper modalOpen={props.modalOpen} closeModal={props.closeMoal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <h1 className={"modalHeading"}>Add Income</h1>
            <label htmlFor="">Description</label>
            <input type="text" placeholder={"Special Funds"} onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Amount</label>
            <input type="number" min={0} value={amount} onChange={(e) => Number(e.target.value) >= 0 && setAmount(e.target.value)}/>
            <label htmlFor="">Date</label>
            <input type="date" onChange={(e) => setAmount(e.target.value)}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={() => props.closeMoal()}>Cancel</button>
                <button className={"button"} onClick={() => submitIncome()}>Add Income</button>
            </div>
        </ModalWrapper>
    )
}