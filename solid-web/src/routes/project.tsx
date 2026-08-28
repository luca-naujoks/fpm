import {useParams} from "@solidjs/router";
import {createMemo, createSignal, For} from "solid-js";
import {IProject, ITransaction} from "../interfaces";
import {CreateTransaction} from "../components/models/createTransaction";
import {UpdateTransaction} from "../components/models/updateTransaction";
import {toast} from "../components/simple-toast/toaster";

export default function Project() {
    const params = useParams()

    const [transactionModalOpen, setTransactionModalOpen] = createSignal<boolean>(false)
    const [selectedTransaction, setSelectedTransaction] = createSignal<ITransaction | null>(null)

    const project = createMemo(() => fetchProject(String(params.id)))
    const transactions = createMemo(() => fetchTransactions(String(params.id)))

    async function fetchProject(id: string): Promise<IProject> {
        const response = await fetch(`/api/project/${id}`)
        if (!response.ok) {
            toast.error("Error Fetching Project")
            return {} as IProject
        }
        return response.json()
    }

    async function fetchTransactions(id: string): Promise<ITransaction[]> {
        const response = await fetch(`/api/project/${id}/transactions`)
        if (!response.ok) {
            toast.error("Error Fetching Transactions")
            return []
        }
        return response.json()
    }

    function toggleTransactionModal() {
        setTransactionModalOpen(prev => !prev)
    }

    function closeUpdateModal() {
        setSelectedTransaction(null)
    }

    function selectTransaction(transaction: ITransaction) {
        setSelectedTransaction(transaction)
    }

    return (
        <main class={"card mt-4"}>
            <CreateTransaction open={transactionModalOpen()} toggle={toggleTransactionModal} projectId={project().id}/>
            <UpdateTransaction open={selectedTransaction() != null} toggle={closeUpdateModal}
                               transaction={selectedTransaction()}/>
            <header class="px-6 py-5">
                <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0">
                        <div class="flex items-center gap-4">
                            <h2 class="mb-0 truncate text-xl font-semibold">
                                {project().title}
                            </h2>

                            <span class="rounded-md bg-background px-2 py-1 font-mono text-xs text-foreground/50">
                                #{project().id}
                            </span>
                        </div>

                        <p class="mb-0 px-0 mt-1 text-sm text-foreground/50">
                            {project().description || "No description"}
                        </p>
                    </div>
                </div>
                <div class={"flex justify-between items-center"}>
                    <div class={"flex gap-4 mt-4"}>
                        <h3>Monthly Budget <span>{project().budget.toFixed(2)}€</span></h3>
                        <h3>Available Budget <span>{project().available_budget.toFixed(2)}€</span></h3>
                    </div>
                    <button class={"button w-fit"} onClick={toggleTransactionModal}>Add Transaction</button>
                </div>
            </header>
            <TransactionTable transactions={transactions()} selectTransaction={selectTransaction}/>
        </main>
    )
}

function TransactionTable(props: {
    transactions: ITransaction[],
    selectTransaction: (transaction: ITransaction) => void
}) {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }
    return (
        <div id="transactionTable" class="w-full overflow-hidden rounded-lg border border-border">
            <div
                class="grid grid-cols-6 gap-4 bg-surface-elevated/40 px-4 py-3 text-sm font-medium text-muted-foreground">
                <span>Type</span>
                <span>Date</span>
                <span class="text-right">Amount</span>
                <span class={"col-span-3"}>Description</span>
            </div>

            <For each={props.transactions}>
                {(transaction: ITransaction) => (
                    <div
                        class="grid grid-cols-6 gap-4 items-center border-t border-border/50 px-4 py-3 text-sm transition-colors hover:bg-surface-elevated/40 cursor-pointer"
                        onClick={() => props.selectTransaction(transaction)}
                    >
                        <span
                            class={transaction.amount < 0 ? "font-medium text-red-500/75" : "font-medium text-green-500/75"}>
                            {transaction.amount < 0 ? "Expense" : "Income"}
                        </span>

                        <span class="text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("de-DE", options)}
                        </span>

                        <span
                            class={["text-right font-medium tabular-nums ", transaction.amount < 0 ? "text-red-500/75" : "text-green-500/75"]}>
                            {transaction.amount.toLocaleString("de-DE", {style: "currency", currency: "EUR",})}
                        </span>

                        <span class="col-span-3 truncate text-foreground">
                            {transaction.description || "—"}
                        </span>
                    </div>
                )}
            </For>
        </div>
    )
}