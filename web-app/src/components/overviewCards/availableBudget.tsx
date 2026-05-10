import {type ReactNode, useEffect, useState} from "react";
import {useProject} from "../../context/projectContext/useProjectContext.ts";

export function AvailableBudget(): ReactNode {
    const {projects} = useProject()
    const [budget, setBudget] = useState<number>(0)

    async function fetchTotalProjectBudget(): Promise<number> {
        let budget: number = 0

        for (let i = 0; i < projects.length; i++) {
            const response = await fetch(`/api/project/budget?projectId=${projects[i].id}`, {method: "GET"})
            const projectBudget: number = await response.json()
            budget = budget + projectBudget
        }

        return budget
    }

    useEffect(() => {
        fetchTotalProjectBudget().then((budget: number) => setBudget(budget))
    }, []);

    return (
        <div className={"card"}>
            <h2>Total Available Budget</h2>
            <h1>{budget.toFixed(2)}€</h1>
        </div>
    )
}