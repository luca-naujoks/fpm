"use client"

import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";
import {deleteTransaction, editTransaction} from "@/app/actions";
import React, {useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {transaction} from "@/interfaces";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    refresh: () => void
}

interface DataWithId {
    id: number;
}

export function DataTable<TData extends DataWithId, TValue>({columns, data, refresh}: DataTableProps<TData, TValue>) {
    // 1. State to track which transaction is being edited
    const [editingTransaction, setEditingTransaction] = useState<transaction | null>(null);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <ContextMenu key={row.id}>
                                <ContextMenuTrigger asChild>
                                    <TableRow data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </ContextMenuTrigger>

                                <ContextMenuContent>
                                    <ContextMenuItem
                                        onSelect={() => setEditingTransaction(row.original as unknown as transaction)}>
                                        Edit Transaction
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        variant={"destructive"}
                                        onClick={() => {
                                            deleteTransaction(row.original.id);
                                            refresh()
                                        }}
                                    >
                                        Delete
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* 3. Single Dialog instance outside the Table loop */}
            {editingTransaction && (
                <EditTransaction
                    transaction={editingTransaction}
                    open={!!editingTransaction}
                    onOpenChange={(open) => !open && setEditingTransaction(null)}
                    refresh={refresh}
                />
            )}
        </div>
    )
}

// 4. Component defined outside to prevent re-mounting focus issues
function EditTransaction({transaction, refresh, open, onOpenChange}: {
    transaction: transaction,
    refresh: () => void,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {

    async function handleAction(formData: FormData) {
        const refinedFormData = new FormData();
        refinedFormData.append("id", transaction.id.toString());
        refinedFormData.append("amount", formData.get("amount") as string);
        refinedFormData.append("description", formData.get("description") as string);

        const result = await editTransaction(refinedFormData);

        if (result?.success) {
            onOpenChange(false);
            refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-1/4">
                <form action={handleAction}>
                    <DialogHeader>
                        <DialogTitle>Edit <span
                            className={transaction.transactionType == "income" ? "text-chart-2" : "text-chart-3"}>{transaction.transactionType}</span> Transaction</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 mb-4">
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" defaultValue={transaction.transactionDescription}
                                   placeholder={transaction.transactionDescription}
                                   required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" name="amount" type="number" step={0.01}
                                   defaultValue={transaction.transactionAmount}
                                   placeholder={transaction.transactionAmount.toString()} required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="transactionDate">Date</Label>
                            <Input id="transactionDate" name="transactionDate" type="date"
                                   defaultValue={transaction.transactionDate ? new Date(transaction.transactionDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                                   required/>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}