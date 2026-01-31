"use client"
import {project, transaction} from "@/interfaces";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {createTransaction, getTransactions} from "@/app/actions";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {DataTable} from "@/components/DataTable";
import {ColumnDef} from "@tanstack/react-table";

export function TransactionComponent({project}: { project: project }) {

    const [transactions, setTransactions] = useState<transaction[]>([])
    const [availableBudget, setAvailableBudget] = useState<number>(0)

    const euroFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });

    const formattedBudget = euroFormatter.format(project.budget || 0);
    const formattedAvailable = euroFormatter.format(availableBudget);

    const columns: ColumnDef<transaction>[] = [
        {
            accessorKey: "transactionDescription",
            header: "Description",
        },
        {
            accessorKey: "transactionType",
            header: "Type",
            // This colors the "Type" cell itself
            cell: ({row}) => {
                const type = row.getValue("transactionType") as string;
                return (
                    <div className={type === "income" ? "text-chart-2" : "text-chart-3"}>
                        {type}
                    </div>
                );
            }
        },
        {
            accessorKey: "transactionAmount",
            header: "Amount",
            // This colors the "Amount" cell based on the "transactionType"
            cell: ({row}) => {
                const amount = parseFloat(row.getValue("transactionAmount"));
                const type = row.getValue("transactionType");

                // Format the number as currency if you like
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "EUR",
                }).format(amount);

                return (
                    <div className={type === "income" ? "text-chart-2" : "text-chart-3"}>
                        {type === "expense" ? `-${formatted}` : formatted}
                    </div>
                );
            },
        },
        {
            accessorKey: "transactionDate",
            header: "Date",
            cell: ({row}) => {
                const value = row.getValue("transactionDate");
                const date = value ? new Date(value as string) : null;
                const formatted = date ? `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}` : "";
                return <div>{formatted}</div>;
            }
        },
    ]

    useEffect(() => {
        async function fetch(): Promise<void> {
            if (project.id == 0) {
                setTransactions([])
                return
            }
            const transactions = getTransactions(project.id)
            setTransactions(await transactions)
        }

        fetch()
    }, [project])

    useEffect(() => {
        let totalExpenses: number = 0
        let totalIncome: number = 0

        const income: number[] = transactions.filter((item) => item.transactionType == "income").map((item) => {
            return item.transactionAmount
        })
        const expenses: number[] = transactions.filter((item) => item.transactionType != "income").map((item) => {
            return item.transactionAmount
        })

        for (const e of income) {
            totalIncome += e
        }
        for (const e of expenses) {
            totalExpenses += e
        }


        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvailableBudget(totalIncome - totalExpenses)

    }, [transactions]);


    async function refetchTransactions() {
        const transactions = await getTransactions(project.id)
        setTransactions(transactions)
    }

    return (
        <div className="w-full bg-card border-sidebar-border border rounded-lg shadow p-4 mr-8">
            <span className={"flex gap-2 justify-between items-center mb-2"}>
                <div>
                    <h2>Project Transactions</h2>
                    <p>Monthly Budget: {formattedBudget}</p>
                    <p className={project.id === 0 ? "hidden" : ""}>Available Budget: <span
                        className={availableBudget > 0 ? "text-chart-2" : "text-chart-3"}>€{formattedAvailable}</span></p>
                </div>
                <span className={"flex gap-2"}>
                    <AddExpense selectedProject={project.id} refetch={refetchTransactions}/>
                    <AddIncome selectedProject={project.id} refetch={refetchTransactions}/>
                </span>
            </span>
            <span className={project.id == 0 ? "hidden" : ""}>
                <DataTable columns={columns} data={transactions} refresh={refetchTransactions}/>
            </span>
            <span
                className={project.id == 0 ? "flex justify-center w-full h-full pt-8 text-foreground/50 text-center" : "hidden"}>
                Feel free to create your first project by clicking the &#34;+ Add&#34; button on the left to start tracking Budgets.<br/>
                Or Select one Your Already Existing Projects to check Budgets
            </span>
        </div>
    )
}

function AddIncome({selectedProject, refetch}: { selectedProject: number, refetch: () => Promise<void> }) {
    const [open, setOpen] = useState(false);

    async function handleAction(formData: FormData) {
        // Get projectId from search params
        const projectId = selectedProject;
        // Get description from form
        const description = formData.get("description")?.toString() || "";
        // Set transactionType for income
        const transactionType = "income";
        // Get amount from form
        const transactionAmountRaw = formData.get("amount");
        const transactionAmount = transactionAmountRaw ? parseFloat(transactionAmountRaw.toString()) : 0;
        // Get date from form (optional, fallback to today)
        const transactionDateRaw = formData.get("transactionDate");
        const transactionDate = transactionDateRaw ? new Date(transactionDateRaw.toString()) : new Date();

        // Prepare FormData for createTransaction
        const enhancedFormData = new FormData();
        enhancedFormData.set("projectId", projectId.toString());
        enhancedFormData.set("description", description);
        enhancedFormData.set("transactionType", transactionType);
        enhancedFormData.set("transactionAmount", transactionAmount.toString());
        enhancedFormData.set("transactionDate", transactionDate.toISOString());

        const result = await createTransaction(enhancedFormData);
        if (result?.success) {
            setOpen(false);
            await refetch()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={"hover:bg-chart-2 "} variant={"secondary"} disabled={selectedProject == 0}>Add
                    Income</Button>
            </DialogTrigger>
            <DialogContent className="max-w-1/4">
                <form action={handleAction}>
                    <DialogHeader>
                        <DialogTitle>Add Income</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4  mb-4">
                        <div className="grid gap-3">
                            <Label htmlFor="amount">Description</Label>
                            <Input id="description" name="description" placeholder="Monthly Income" required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="amount">Income</Label>
                            <Input id="amount" name="amount" type="number" step={0.01} defaultValue={25.00}/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="transactionDate">Date</Label>
                            <Input id="transactionDate" name="transactionDate" type="date"
                                   defaultValue={new Date().toISOString().slice(0, 10)} required/>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddExpense({selectedProject, refetch}: { selectedProject: number, refetch: () => Promise<void> }) {
    const [open, setOpen] = useState(false);

    async function handleAction(formData: FormData) {
        // Get projectId from search params
        const projectId = selectedProject;
        // Get description from form
        const description = formData.get("description")?.toString() || "";
        // Set transactionType for expense
        const transactionType = "expense";
        // Get amount from form
        const transactionAmountRaw = formData.get("amount");
        const transactionAmount = transactionAmountRaw ? parseFloat(transactionAmountRaw.toString()) : 0;
        // Get date from form (optional, fallback to today)
        const transactionDateRaw = formData.get("transactionDate");
        const transactionDate = transactionDateRaw ? new Date(transactionDateRaw.toString()) : new Date();

        // Prepare FormData for createTransaction
        const enhancedFormData = new FormData();
        enhancedFormData.set("projectId", projectId.toString());
        enhancedFormData.set("description", description);
        enhancedFormData.set("transactionType", transactionType);
        enhancedFormData.set("transactionAmount", transactionAmount.toString());
        enhancedFormData.set("transactionDate", transactionDate.toISOString());

        const result = await createTransaction(enhancedFormData);

        if (result?.success) {
            setOpen(false);
            await refetch()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={"hover:bg-chart-1 "} variant={"secondary"} disabled={selectedProject == 0}>Add
                    Expense</Button>
            </DialogTrigger>
            <DialogContent className="max-w-1/4">
                <form action={handleAction}>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 mb-4">
                        <div className="grid gap-3">
                            <Label htmlFor="amount">Description</Label>
                            <Input id="description" name="description" placeholder="Bluray" required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="amount">Expense Amount</Label>
                            <Input id="amount" name="amount" type="number" step={0.01} defaultValue={25.00}/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="transactionDate">Date</Label>
                            <Input id="transactionDate" name="transactionDate" type="date"
                                   defaultValue={new Date().toISOString().slice(0, 10)} required/>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}