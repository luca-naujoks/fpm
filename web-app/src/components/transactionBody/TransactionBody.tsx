import './TransactionBody.css';
import {type JSX, useCallback, useEffect, useState} from "react";
import type {ITransaction} from "../../interfaces.ts";
import {TotalBudget} from "../overviewCards/totalBudget.tsx";
import {ActiveProjects} from "../overviewCards/activeProjects.tsx";
import {AvailableBudget} from "../overviewCards/availableBudget.tsx";
import {SpendBudget} from "../overviewCards/spendBudget.tsx";
import {ContextMenu} from "../contextMenu/contextMenu.tsx";
import {useProject} from "../../context/projectContext/useProjectContext.ts";
import {useTransactionContext} from "../../context/transactionContext/useTransactionModal.ts";
import {BurgerMenuButton} from "../BurgerMenuButton.tsx";

export function TransactionBody(): JSX.Element {
    const {selectedProject} = useProject()
    const {openTransactionModal, transactions, fetchTransactions} = useTransactionContext()

    const [budget, setBudget] = useState<number>(0)

    const fetchTransactionsCallback = useCallback(async () => {
        if (!selectedProject) {
            return
        }

        fetchTransactions(selectedProject.id)
    }, [selectedProject])

    const fetchProjectBudget = useCallback(async (): Promise<number> => {
        if (!selectedProject) {
            return 0
        }
        const response = await fetch(`/api/project/budget?projectId=${selectedProject?.id}`, {method: "GET"})
        return await response.json()
    }, [selectedProject])

    useEffect(() => {
        fetchProjectBudget().then((budget: number) => setBudget(budget))
        fetchTransactionsCallback().then(() => {
        })
    }, [fetchProjectBudget, fetchTransactionsCallback, selectedProject]);

    useEffect(() => {
        fetchProjectBudget().then((budget: number) => setBudget(budget))
    }, [fetchProjectBudget, transactions]);

    if (!selectedProject) {
        return (
            <div className={"w-full"}>
                <div className={"flex gap-2 mb-4 items-center"}>
                    <BurgerMenuButton/>
                    <h1 className={""}>Home Overview</h1>
                </div>
                <div className={"w-full h-36 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"}>
                    <TotalBudget/>
                    <SpendBudget/>
                    <AvailableBudget/>
                    <ActiveProjects/>
                </div>
            </div>
        )
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

    const transactionModalProps: ITransaction = {
        id: 0,
        project_id: selectedProject.id,
        description: "",
        amount: 0,
        date: new Date()
    }

    return (
        <div className={"max-h-screen overflow-scroll pb-8"}>
            <div id={"TransactionHead"} className={"flex justify-between items-end"}>
                <div className={"flex flex-col"}>
                    <div className={"flex"}>
                        <BurgerMenuButton/>
                        <span>
                        <h1>{selectedProject.name}</h1>
                        <span
                            className={"max-h-16 max-w-96 text-ellipsis overflow-hidden"}>{selectedProject.description}</span>
                        </span>
                    </div>
                    <p className={"flex flex-col lg:flex-row"}>
                        <span className={"mr-4"}>Monthly Budget: {selectedProject.budget}€ </span>
                        <span>Available Budget: <span
                            className={colorSwitch()}>{budget}€</span></span>
                    </p>
                </div>
                <button className={"button"} onClick={() => openTransactionModal(transactionModalProps)}>
                    Add Transaction
                </button>
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
                    <TransactionRow key={transaction.id} transaction={transaction}
                    />
                )}
                </tbody>
            </table>
        </div>
    )
}

function TransactionRow({transaction}: { transaction: ITransaction }): JSX.Element {
    const transactionDate = new Date(transaction.date)
    const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false)
    const [position, setPosition] = useState<{ x: number, y: number }>({x: 0, y: 0});

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    };

    return (
        <>
            <ContextMenu key={position.x + position.y} position={position} open={contextMenuOpen}
                         transaction={transaction} close={() => setContextMenuOpen(false)}
            />
            <tr onContextMenu={(e) => {
                e.preventDefault();
                setPosition({x: e.pageX, y: e.pageY});
                setContextMenuOpen(true);
            }}>
                <td>{transaction.amount > 0 ? <span className={"text-green-600"}>Income</span> :
                    <span className={"text-yellow-600"}>Expense</span>}</td>
                <td>{transactionDate.toLocaleDateString('de-DE', options)}</td>
                <td>{transaction.amount > 0 ?
                    <span className={"text-green-600"}>{transaction.amount} €</span> :
                    <span className={"text-yellow-600"}>{transaction.amount} €</span>
                }</td>
                <td>{transaction.description}</td>
            </tr>
        </>
    )
}