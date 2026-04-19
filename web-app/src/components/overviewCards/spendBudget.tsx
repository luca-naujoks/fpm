import './cards.css'
import {type JSX, useEffect, useState} from "react";

export function SpendBudget(): JSX.Element {
    const [spendBudget, setSpendBudget] = useState<number>(0)

    async function fetchTotalProjectBudget(): Promise<number> {
        const projectResponse = await fetch("/api/spend", {method: "GET"})

        return await projectResponse.json()
    }

    useEffect(() => {
        fetchTotalProjectBudget().then((budget: number) => setSpendBudget(budget))
    }, []);

    return (
        <div className={"card"}>
            <h2>Total Spend Budget</h2>
            <h1>{spendBudget}€</h1>
        </div>
    )
}