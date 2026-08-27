import {createEffect, createMemo, createSignal, Show} from "solid-js";
import {ITransaction} from "../../interfaces";

export interface ITransactionProps {
    open: boolean,
    toggle: () => void,
    transaction: ITransaction | null
}

export function UpdateTransaction(props: ITransactionProps) {
    const [transactionId, setTransactionId] = createSignal<number>(0)
    const [projectId, setProjectId] = createSignal<number>(0)
    const [description, setDescription] = createSignal<string>("")
    const [amount, setAmount] = createSignal<string>("0")
    const [date, setDate] = createSignal<Date>(new Date())

    const amountAsNumber = createMemo(() => Number(amount()))

    createEffect(
        () => props.transaction,
        () => {
            if (!props.transaction) {
                return
            }

            setTransactionId(props.transaction.id)
            setProjectId(props.transaction.project_id)
            setDescription(props.transaction.description)
            setAmount(props.transaction.amount.toString())
            setDate(props.transaction.date)
        }
    )

    async function submitTransaction() {
        const body: ITransaction = {
            id: transactionId(),
            project_id: projectId(),
            description: description(),
            amount: amountAsNumber(),
            date: date()
        }
        const response = await fetch(`/api/project/${projectId()}/transaction`, {
            method: "PUT",
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            // TODO: add Error Notification
            return
        }
        props.toggle()
    }

    return (
        <div
            class={["fixed w-screen h-screen top-0 left-0 z-10 bg-black/50 flex items-center justify-center", props.open ? "block" : "hidden"]}
            onClick={() => props.toggle()}>
            <div class={"w-fit h-fit flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm"}
                 onClick={(event) => event.stopPropagation()}>
                <header class="border-b border-border px-6 py-5">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-4">
                                <h2 class="mb-0 truncate text-xl font-semibold">
                                    Update Transaction
                                </h2>
                            </div>

                            <p class="mb-0 px-0 mt-1 text-sm text-start text-foreground/50">
                                Update a new Transaction by filling the required Fields
                            </p>
                        </div>
                    </div>
                </header>
                <Show when={transactionId() != 0}
                      fallback={<div>oops looks like we messed up transferring the Transaction data into this
                          modal</div>}>
                    <div class={"flex flex-col gap-4 mt-4"}>
                        <label>
                            Description
                            <input type="text" placeholder={"Stuff in my Rack"} value={description()}
                                   onChange={(e) => setDescription(e.target.value)}/>
                        </label>
                        <label>
                            Amount
                            <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40">
                                €
                            </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount()}
                                    placeholder="20"
                                    class={"pl-8"}
                                    onInput={(event) =>
                                        setAmount(event.currentTarget.value)
                                    }
                                />
                            </div>
                        </label>
                        <label>
                            Date
                            <input type="date" value={new Date(date()).toISOString().slice(0, 10)}
                                   onChange={(e) => setDate(new Date(e.target.value))}/>
                        </label>
                    </div>
                    <div class={"flex gap-4 justify-end mt-8"}>
                        <button class={"button"} onClick={() => submitTransaction()}>Update Transaction</button>
                    </div>
                </Show>
            </div>
        </div>
    )
}