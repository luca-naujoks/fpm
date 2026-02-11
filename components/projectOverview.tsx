"use client"
import {project} from "@/interfaces";
import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {StatusCard} from "@/components/statusCard";
import {getAllExpenses, getAllIncomes} from "@/app/actions";

export function ProjectOverview({projects}: { projects: project[] }) {
    const [totalExpenses, setTotalExpenses] = useState<number>(0)
    const [totalRemaining, setTotalRemaining] = useState<number>(0)
    const [totalBudget, setTotalBudget] = useState<number>(0)


    useEffect(() => {
        async function calc() {
            const incomes = await getAllIncomes()
            const expenses = await getAllExpenses()

            let tempIncomes: number = 0
            let tempExpenses: number = 0
            let tempBudget: number = 0

            for (let i = 0; i < expenses.length; i++) {
                tempExpenses = tempExpenses + expenses[i].transactionAmount
            }
            for (let i = 0; i < incomes.length; i++) {
                tempIncomes = tempIncomes + incomes[i].transactionAmount
            }

            for (let i = 0; i < projects.length; i++) {
                tempBudget = tempBudget + projects[i].budget
            }

            setTotalRemaining(tempIncomes - tempExpenses)
            setTotalExpenses(tempExpenses)
            setTotalBudget(tempBudget)
        }

        if (projects.length > 0) {
            calc().then()
        }
    }, [projects])


    if (projects.length <= 0) {
        return (
            <div className={"w-full justify-center"}>
                <span className={"flex justify-center w-full h-full pt-8 text-foreground/50 text-center"}>
                    Feel free to create your first project by clicking the &#34;+ Add&#34; button on the left to start tracking Budgets.<br/>
                    Or Select one Your Already Existing Projects to check Budgets
                </span>
            </div>
        )
    }

    return (
        <Card className={"w-full h-full"}>
            <CardHeader>
                <h2 className={"text-muted-foreground"}>Project Overview</h2>
            </CardHeader>
            <CardContent className={"h-full grid grid-cols-4 grid-rows-4 gap-4"}>
                <StatusCard title={"Total Budget"} value={totalBudget.toFixed(2) + "€"}
                            footer={`Across ${projects.length} projects`}/>
                <StatusCard title={"Total Spend"} value={totalExpenses.toFixed(2) + "€"}
                            footer={`Across ${projects.length} projects`}
                            color={"destructive"}/>
                <StatusCard title={"Remaining"} value={totalRemaining.toFixed(2) + "€"}
                            footer={`Across ${projects.length} projects`} color={"positive"}/>
                <StatusCard title={"Active Projects"} value={projects.length} footer={``}/>

                <Card className={"col-span-2 text-muted-foreground hidden"}>
                    <CardHeader>
                        <h2>By Month Expenses</h2>
                        <span>Total finances across all projects</span>
                    </CardHeader>
                    <CardContent>

                    </CardContent>
                </Card>
                <Card className={"col-span-2 text-muted-foreground"}>
                    <CardHeader>
                        <h2>Spending by Project</h2>
                        <span>Expenses by Project</span>
                        <span>Update</span>
                    </CardHeader>
                    <CardContent>
                    </CardContent>
                </Card>

            </CardContent>
        </Card>
    )
}