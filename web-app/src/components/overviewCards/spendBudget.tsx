import {type ReactNode, useEffect, useState} from "react";

export function SpendBudget(): ReactNode {
    const [spendBudget, setSpendBudget] = useState<number>(0)

    async function fetchTotalProjectBudget(): Promise<number> {
        const projectResponse = await fetch("/api/spend", {method: "GET"})

        const data: { value: number } = await projectResponse.json() as { value: number };

        return data.value
    }

    useEffect(() => {
        fetchTotalProjectBudget().then((budget: number) => setSpendBudget(budget))
    }, []);

    return (
        <div className={"card"}>
            <h2>Total Spend Budget</h2>
            <h1>{spendBudget.toFixed(2)}€</h1>
        </div>
    )
}