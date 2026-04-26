import {type JSX, useEffect, useState} from "react";
import type {IProject} from "../../interfaces.ts";

export function TotalBudget(): JSX.Element {
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0)

    async function fetchTotalProjectBudget(): Promise<number> {
        let budget: number = 0

        const projectResponse = await fetch("/api/projects", {method: "GET"})
        const projects: IProject[] = await projectResponse.json()

        for (let i = 0; i < projects.length; i++) {
            budget = budget + projects[i].budget
        }

        return budget
    }

    useEffect(() => {
        fetchTotalProjectBudget().then((budget: number) => setMonthlyBudget(budget))
    }, []);

    return (
        <div className={"card"}>
            <h2>Total Budget (Monthly)</h2>
            <h1>{monthlyBudget.toFixed(2)}€</h1>
        </div>
    )
}