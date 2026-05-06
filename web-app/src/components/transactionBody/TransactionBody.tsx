import './TransactionBody.css';
import {type ReactNode, useCallback, useEffect, useRef, useState} from "react";
import type {ITransaction} from "../../interfaces.ts";
import {ContextMenu, type IContextMenuProps} from "../contextMenu/contextMenu.tsx";
import {useProject} from "../../context/projectContext/useProjectContext.ts";
import {useTransactionContext} from "../../context/transactionContext/useTransactionModal.ts";
import {BurgerMenuButton} from "../BurgerMenuButton.tsx";
import {ActiveProjects} from "../overviewCards/activeProjects.tsx";
import {TotalBudget} from "../overviewCards/totalBudget.tsx";
import {SpendBudget} from "../overviewCards/spendBudget.tsx";
import {AvailableBudget} from "../overviewCards/availableBudget.tsx";
import {useSidebar} from "../../context/sidebarContext/useSidebarContext.ts";


export function TransactionBody(): ReactNode {
    const {selectedProject} = useProject()
    const {openTransactionModal, transactions, fetchTransactions} = useTransactionContext()
    const {sidebarOpen, toggleSidebar} = useSidebar()

    const [contextMenuProps, setContextMenuProps] = useState<IContextMenuProps>({
        open: false,
        position: {x: 0, y: 0},
        transaction: {} as ITransaction,
        close: () => void {}
    } as IContextMenuProps)

    const longPressTimerRef = useRef<number | null>(null)

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current)
            longPressTimerRef.current = null
        }
    }, [])

    const openMenuAt = useCallback((e: { clientX: number; clientY: number }, transaction: ITransaction) => {
        setContextMenuProps({
            open: true,
            position: {x: e.clientX, y: e.clientY},
            transaction: transaction,
            close: () =>
                setContextMenuProps((prev: IContextMenuProps) => ({...prev, open: false}))
        })
    }, [])

    const [budget, setBudget] = useState<number>(0)

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    };

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
            <Overview/>
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
        <>
            <ContextMenu key={contextMenuProps.position.x + contextMenuProps.position.y} props={contextMenuProps}
            />
            <div className={"max-h-[95%] lg:max-h-screen overflow-scroll pb-8"}
                 onClick={sidebarOpen && window.innerWidth <= 512 ? toggleSidebar : () => void{}}>
                <div id={"TransactionHead"} className={"flex flex-col mr-1"}>
                    <div className={"flex"}>
                        <BurgerMenuButton/>
                        <span>
                        <h1>{selectedProject.name}</h1>
                        <span
                            className={"max-h-16 max-w-96 text-ellipsis overflow-hidden"}>{selectedProject.description}</span>
                        </span>
                    </div>
                    <p className={"border border-(--border) w-full lg:w-1/2 my-2"}/>
                    <div className={"flex justify-between items-end"}>
                        <p className={"flex flex-col lg:flex-row"}>
                            <span className={"mr-4"}>Monthly Budget: {selectedProject.budget}€ </span>
                            <span>Available Budget: <span
                                className={colorSwitch()}>{budget}€</span></span>
                        </p>
                        <button className={"button"} onClick={() => openTransactionModal(transactionModalProps)}>
                            Add Transaction
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
                        <tr key={transaction.id}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenuProps({
                                    open: true,
                                    position: {x: e.pageX, y: e.pageY},
                                    transaction: transaction,
                                    close: () => setContextMenuProps((prev: IContextMenuProps) => ({
                                        ...prev,
                                        open: false
                                    }))
                                })
                            }
                            }
                            onPointerDown={(e) => {
                                // Long-press to open on mobile/tablet
                                // If right button / mouse, you may not want this; feel free to remove the check.
                                if (e.pointerType === "mouse" && e.button !== 0) return

                                clearLongPressTimer()
                                longPressTimerRef.current = window.setTimeout(() => {
                                    openMenuAt({clientX: e.clientX, clientY: e.clientY}, transaction)
                                }, 450) // adjust (300-600ms is typical)
                            }}
                            onPointerUp={() => clearLongPressTimer()}
                            onPointerCancel={() => clearLongPressTimer()}
                            onPointerLeave={() => clearLongPressTimer()}>
                            <td>{transaction.amount > 0 ? <span className={"text-green-600"}>Income</span> :
                                <span className={"text-yellow-600"}>Expense</span>}</td>
                            <td>{new Date(transaction.date).toLocaleDateString('de-DE', options)}</td>
                            <td>{transaction.amount > 0 ?
                                <span className={"text-green-600"}>{transaction.amount} €</span> :
                                <span className={"text-yellow-600"}>{transaction.amount} €</span>
                            }</td>
                            <td>{transaction.description}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function Overview(): ReactNode {
    const {sidebarOpen, toggleSidebar} = useSidebar()
    return (
        <div className={"w-full"} onClick={sidebarOpen && window.innerWidth <= 512 ? toggleSidebar : () => void{}}>
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