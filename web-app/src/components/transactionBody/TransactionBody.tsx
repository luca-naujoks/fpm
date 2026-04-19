import './TransactionBody.css';
import {type JSX, useCallback, useEffect, useState} from "react";
import type {IProject, ITransaction} from "../../interfaces.ts";
import {CreateExpenseModal, CreateIncomeModal, type createTransactionProps} from "../modals/createTransaction.tsx";
import {TotalBudget} from "../overviewCards/totalBudget.tsx";
import {ActiveProjects} from "../overviewCards/activeProjects.tsx";
import {AvailableBudget} from "../overviewCards/availableBudget.tsx";
import {SpendBudget} from "../overviewCards/spendBudget.tsx";
import {ContextMenu} from "../contextMenu/contextMenu.tsx";

export interface TransactionBodyProps {
    project: IProject | undefined
}

export function TransactionBody({project}: TransactionBodyProps): JSX.Element {
    const [expenseModalOpen, setExpenseModalOpen] = useState<boolean>(false)
    const [incomeModalOpen, setIncomeModalOpen] = useState<boolean>(false)

    const [transactions, setTransactions] = useState<ITransaction[]>([])
    const [budget, setBudget] = useState<number>(0)


    const fetchTransactions = useCallback(async (): Promise<ITransaction[]> => {
        const response = await fetch(`/api/transactions?projectId=${project?.id}`, {method: "GET"})
        return await response.json()
    }, [project])

    const fetchProjectBudget = useCallback(async (): Promise<number> => {
        const response = await fetch(`/api/project/budget?projectId=${project?.id}`, {method: "GET"})
        return await response.json()
    }, [project])

    useEffect(() => {
        if (!project) {
            return
        }
        fetchTransactions().then((transactions: ITransaction[]) => setTransactions(transactions))
        fetchProjectBudget().then((budget: number) => setBudget(budget))

    }, [fetchProjectBudget, fetchTransactions, project]);

    function refreshTransactions(): void {
        fetchTransactions().then((transactions: ITransaction[]) => setTransactions(transactions))
    }

    if (!project) {
        return (
            <div>
                <h1 className={"mb-4"}>Home Overview</h1>
                <div className={"w-full h-36 grid grid-cols-4 gap-4"}>
                    <TotalBudget/>
                    <SpendBudget/>
                    <AvailableBudget/>
                    <ActiveProjects/>
                </div>
            </div>
        )
    }

    const expenseProps: createTransactionProps = {
        modalOpen: expenseModalOpen,
        closeMoal: () => setExpenseModalOpen(false),
        transactionRefetch: refreshTransactions,
        project: project
    }
    const incomeProps: createTransactionProps = {
        modalOpen: incomeModalOpen,
        closeMoal: () => setIncomeModalOpen(false),
        transactionRefetch: refreshTransactions,
        project: project
    }

    function colorSwitch(): string {
        switch (true) {
            case budget == 0:
                return ""
            case budget >= 0:
                return "text-green-600"
            case budget <= 0:
                return "text-yellow-600"
        }
        return ""
    }


    return (
        <div>
            <CreateExpenseModal props={expenseProps}/>
            <CreateIncomeModal props={incomeProps}/>
            <div className={"flex justify-between"}>
                <div>
                    <h1>{project.name}</h1>
                    <p className={"max-h-16 w-96 text-ellipsis overflow-hidden"}>{project.description}</p>
                    <div className={"text-xs mt-4"}>
                        <span className={"mr-4"}>Monthly Budget: {project.budget}€ </span>
                        <span>Available Budget: <span
                            className={colorSwitch()}>{budget}€</span></span>
                    </div>
                </div>
                <div className={"flex gap-4 items-end"}>
                    <button className={"expenseButton"} onClick={() => setExpenseModalOpen(true)}>Add
                        Expense
                    </button>
                    <button className={"incomeButton"} onClick={() => setIncomeModalOpen(true)}>Add Income
                    </button>
                </div>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((transaction: ITransaction) =>

                    <TransactionRow key={transaction.id} transaction={transaction} refreshTransactions={refreshTransactions}/>
                )}
                </tbody>
            </table>
        </div>
    )
}

function TransactionRow({transaction, refreshTransactions}: { transaction: ITransaction, refreshTransactions: () => void }): JSX.Element {
    const transactionDate = new Date(transaction.date)
    const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false)
    const [position, setPosition] = useState<{ x: number, y: number }>({x: 0, y: 0});

    return (
        <>
            <ContextMenu key={position.x + position.y} position={position} open={contextMenuOpen}
                         transaction={transaction} close={() => setContextMenuOpen(false)} refreshTransactions={refreshTransactions}/>
            <tr onContextMenu={(e) => {
                e.preventDefault();
                setPosition({x: e.pageX, y: e.pageY});
                setContextMenuOpen(true);
            }}>
                <td>{transaction.amount > 0 ? <span className={"text-green-600"}>Income</span> :
                    <span className={"text-yellow-600"}>Expense</span>}</td>
                <td>{transactionDate.toLocaleDateString('en-GB').replace("/", ".")}</td>
                <td>{transaction.amount > 0 ?
                    <span className={"text-green-600"}>{transaction.amount} €</span> :
                    <span className={"text-yellow-600"}>{transaction.amount} €</span>
                }</td>
                <td>{transaction.description}</td>
            </tr>
        </>
    )
}