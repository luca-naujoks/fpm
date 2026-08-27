import {Show} from "solid-js";
import {IProject} from "../interfaces";
import {useNavigate} from "@solidjs/router";
import {Router} from "../router";

interface INumberCard {
    title: string
    value: number
    currency: boolean
}

export function EmptyProjectCard(props: { open: () => void }) {
    return (
        <div
            class="flex items-center justify-center card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onClick={() => props.open()}
        >
            <div class="text-center">
                <div class="mb-2 text-lg font-medium">
                    New Project
                </div>

                <div class="text-sm text-foreground/50">
                    Click to create a New Project
                </div>
            </div>
        </div>
    )
}

export function NumberCard(props: INumberCard) {
    return (
        <div
            class="flex h-full w-full flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div class="flex items-start justify-between gap-4">
                <span class="text-sm font-medium text-foreground/50">
                    {props.title}
                </span>

                <Show when={props.currency}>
                    <span class="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                        EUR
                    </span>
                </Show>
            </div>

            <div class="mt-6 flex items-baseline gap-1">
                <span class="text-4xl font-semibold tracking-tight text-accent">
                    {props.value.toFixed(2)}
                </span>

                <Show when={props.currency}>
                    <span class="text-xl font-medium text-accent/60">
                        €
                    </span>
                </Show>
            </div>
        </div>
    )
}

export function ProjectCard(props: { project: IProject }) {
    const navigate = useNavigate()

    return (
        <div
            class="flex flex-col justify-end gap-4 card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onClick={() => navigate(Router.paths.project(props.project.id), {replace: true})}>
            <div>
                <span class="text-sm text-foreground/50">
                    {props.project.description}
                </span>

                <h2 class="mt-1 text-2xl font-semibold tracking-tight text-accent">
                    {props.project.title}
                </h2>
            </div>

            <div class="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                    <h4 class="mb-1 text-xs font-medium uppercase tracking-wider text-foreground/40">
                        Monthly Budget
                    </h4>

                    <span class="text-lg font-semibold">
                        {props.project.budget.toFixed(2)} €
                    </span>
                </div>
                <div>
                    <h4 class="mb-1 text-xs font-medium uppercase tracking-wider text-foreground/40">
                        Available
                    </h4>

                    <span class="text-lg font-semibold">
                        {props.project.available_budget.toFixed(2)} €
                    </span>
                </div>
            </div>

            <div class="rounded-lg border border-border bg-background/50 p-4">
                <div class="flex items-center justify-between gap-4">
                    <span class="text-xs font-medium uppercase tracking-wider text-foreground/40">
                        Last transaction
                    </span>

                    <span
                        class={["rounded-full px-2.5 py-1 text-xs font-medium", props.project.last_transaction.amount > 0
                            ? "bg-green-500/10 text-green-500/75"
                            : "bg-red-500/10 text-red-500/75"]}
                    >
                        {props.project.last_transaction.amount > 0
                            ? "Income"
                            : "Expense"}
                    </span>
                </div>

                <div class="mt-2 flex items-baseline justify-between gap-4">
                    <span class="text-sm text-foreground/60">
                        {props.project.last_transaction.amount > 0
                            ? "Money received"
                            : "Money spent"}
                    </span>

                    <span class="text-lg font-semibold">
                        {props.project.last_transaction.amount > 0 ? "+" : ""}
                        {props.project.last_transaction.amount.toFixed(2)} €
                    </span>
                </div>
            </div>
        </div>
    )
}

export function SkeletonCard(props: { class?: string }) {
    return (
        <div class={`flex items-center justify-center card cursor-pointer animate-pulse ${props.class}`}/>
    )
}