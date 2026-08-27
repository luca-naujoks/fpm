import {createMemo, createSignal} from "solid-js";
import {IProjectSettings} from "../../interfaces";

export function CreateProject(props: { open: boolean, toggle: () => void }) {
    const [title, setTitle] = createSignal<string>("")
    const [description, setDescription] = createSignal<string>("")
    const [budget, setBudget] = createSignal<string>("20")

    const budgetAsNumber = createMemo(() => Number(budget()))

    async function submitProject() {
        const body: IProjectSettings = {
            id: 0,
            title: title(),
            description: description(),
            budget: budgetAsNumber(),
        }
        const response = await fetch("/api/project", {method: "POST", body: JSON.stringify(body)})
        if (!response.ok) {
            // TODO: add Error Notification
            return
        }
        props.toggle()
    }

    return (
        <div
            class={["absolute w-screen h-screen top-0 left-0 z-10 bg-black/50 flex items-center justify-center", props.open ? "block" : "hidden"]}
            onClick={() => props.toggle()}>
            <div class={"w-fit h-fit flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm"}
                 onClick={(event) => event.stopPropagation()}>
                <header class="border-b border-border px-6 py-5">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-4">
                                <h2 class="mb-0 truncate text-xl font-semibold">
                                    Project Creation
                                </h2>
                            </div>

                            <p class="mb-0 px-0 mt-1 text-sm text-start text-foreground/50">
                                Create a new Project by filling the required Fields
                            </p>
                        </div>
                    </div>
                </header>
                <div class={"flex flex-col gap-4 mt-4"}>
                    <label>Project Name
                        <input type="text" placeholder={"Home Lab"} onChange={(e) => setTitle(e.target.value)}/>
                    </label>
                    <label>Project Description
                        <input type="text" placeholder={"Stuff in my Rack"}
                               onChange={(e) => setDescription(e.target.value)}/>
                    </label>
                    <label>Project Budget
                        <input type="number" placeholder={"20"} defaultValue={20}
                               onChange={(e) => setBudget(e.target.value)}/>
                    </label>
                </div>
                <div class={"flex gap-4 justify-end mt-8"}>
                    <button class={"button"} onClick={() => submitProject()}>Create Project</button>
                </div>
            </div>
        </div>
    )
}