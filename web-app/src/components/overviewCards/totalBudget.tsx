import {type ReactNode, useEffect, useState} from "react";
import {useProject} from "../../context/projectContext/useProjectContext.ts";

export function TotalBudget(): ReactNode {
    const {projects} = useProject()
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0)

    function fetchTotalProjectBudget(): number {
        let budget: number = 0

        for (let i = 0; i < projects.length; i++) {
            budget = budget + projects[i].budget
        }

        return budget
    }

    useEffect(() => {
        const budget: number = fetchTotalProjectBudget()
        setMonthlyBudget(budget)
    }, []);

    return (
        <div className={"card"}>
            <h2>Total Budget (Monthly)</h2>
            <h1>{monthlyBudget.toFixed(2)}€</h1>
        </div>
    )
}