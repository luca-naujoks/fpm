import {IProject, IProjectSettings, ITransaction} from "../../interfaces";
import {createEffect, createMemo, createSignal, Loading} from "solid-js";
import {toast} from "../../utils/simple-toast/toaster";
import {navigationBar} from "../../utils/simple-nav/nav-bar";

export function ProjectSettings(props: { project: IProject, refetch: () => void }) {
    const [pinned, setPinned] = createSignal<boolean>(false)
    const project = createMemo(() => props.project);

    createEffect(
        () => project(),
        (prj) => {
            setPinned(prj.pinned)
        }
    )

    async function togglePinnedState() {
        const response = await fetch(`/api/project/${project().id}/pin`, {method: "PUT"})
        if (!response.ok) {
            toast.error(`Failed to ${pinned() ? "Unpin Project" : "Pin Project"}`)
        }

        setPinned((prev) => !prev)
        navigationBar.refresh()
    }

    return (
        <section class="rounded-xl border border-border bg-surface col-span-3">
            <header class="border-b border-border px-6 py-5">
                <div class="flex items-center justify-between gap-4">
                    <div class="text-start">
                        <div class="flex items-center gap-4">
                            <h2 class="mb-0 truncate text-xl font-semibold">
                                {project().title}
                            </h2>

                            <span class="rounded-md bg-background px-2 py-1 font-mono text-xs text-foreground/50">
                                #{project().id}
                            </span>
                        </div>
                        <span class="mt-1 text-sm text-foreground/50">
                            {project().description}
                        </span>
                    </div>
                    <button class={"button w-32"}
                            onClick={togglePinnedState}>{pinned() ? "Unpin Project" : "Pin Project"}</button>
                </div>
            </header>

            <div class="p-6">
                <div class="flex flex-col">
                    <ProjectDetails project={project()} refetch={props.refetch}/>
                    <TransactionSection projectId={project().id}/>
                    <DangerZone projectId={project().id} refresh={props.refetch}/>
                </div>
            </div>
        </section>

    );
}

function ProjectDetails(props: { project: IProject, refetch: () => void }) {
    const project = createMemo<IProject>(() => props.project)

    const [title, setTitle] = createSignal<string>("");
    const [description, setDescription] = createSignal<string>("");
    const [budget, setBudget] = createSignal<string>("");
    const [pinned, setPinned] = createSignal<boolean>(false)
    const budgetAsNumber = createMemo(() => Number(budget()));

    const hasChanges = createMemo(() =>
        title() !== project().title ||
        description() !== project().description ||
        budgetAsNumber() !== project().budget
    );

    createEffect(
        () => props.project,
        (project) => {
            setTitle(project.title);
            setDescription(project.description)
            setBudget(project.budget.toString())
            setPinned(project.pinned)
        }
    )

    async function updateProject() {
        const body: IProjectSettings = {
            id: project().id,
            title: title(),
            description: description(),
            budget: budgetAsNumber(),
            pinned: pinned()
        };

        const response = await fetch(`/api/project/${project().id}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            toast.error("Updating Project")
            return;
        }
        props.refetch()
        toast.success("Project Updated Successfully")
    }

    return (
        <div>
            <Loading>
                <div class="flex flex-col gap-6">
                    <label>
                        Project name
                        <input
                            type="text"
                            value={title()}
                            placeholder="Home Lab"
                            onInput={(event) =>
                                setTitle(event.currentTarget.value)
                            }
                        />
                    </label>
                    <label>
                        Description

                        <textarea
                            rows="3"
                            value={description()}
                            placeholder="Stuff in my Rack"
                            class={"overflow-x-hidden"}
                            onInput={(event) =>
                                setDescription(event.currentTarget.value)
                            }
                        />
                    </label>
                    <label>
                        Budget
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40">
                                €
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budget()}
                                placeholder="20"
                                class={"pl-8"}
                                onInput={(event) =>
                                    setBudget(event.currentTarget.value)
                                }
                            />
                        </div>
                    </label>
                </div>
            </Loading>

            <div id={"controls"} class="mt-6 flex justify-end gap-4 pt-5">
                <button
                    type="button"
                    class="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!hasChanges()}
                    onClick={() => {
                        setTitle(project().title);
                        setDescription(project().description);
                        setBudget(project().budget.toString());
                    }}
                >
                    Reset
                </button>

                <button
                    type="button"
                    class="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!hasChanges()}
                    onClick={updateProject}
                >
                    Save changes
                </button>
            </div>
        </div>
    )
}

function TransactionSection(props: { projectId: number }) {
    const transactions = createMemo(() => fetchTransactions());
    const [importFile, setImportFile] = createSignal<File | undefined>(undefined);
    // oxlint-disable-next-line no-unassigned-vars
    let fileInput!: HTMLInputElement

    async function fetchTransactions(): Promise<ITransaction[]> {
        const response = await fetch(
            `/api/project/${props.projectId}/transactions`
        );

        if (!response.ok) {
            return [];
        }

        return response.json();
    }

    async function importTransactions() {
        const file = importFile();

        if (!file) {
            return;
        }

        try {
            const fileText = await file.text();
            const jsonContent: ITransaction[] = JSON.parse(fileText);

            const response = await fetch(
                "/api/transaction/import",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        project_id: props.projectId,
                        transactions: jsonContent,
                    }),
                }
            );

            if (!response.ok) {
                toast.error("Request for importing Transactions")
                return;
            }

            setImportFile(undefined);
            fileInput.value = "";

            toast.success("Successfully imported Transactions")
        } catch {
            toast.error("Failed to Import Transactions")
        }
    }

    async function exportTransactions() {
        try {
            const response = await fetch(
                `/api/transaction/export?project_id=${props.projectId}`
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            const blob = new Blob(
                [JSON.stringify(data, null, 2)],
                {type: "application/json"}
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `transactions-${new Date().toISOString().split("T")[0]}.json`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch {
            toast.error("Transaction Export Failed")
        }
    }

    const onFileChange = (event: Event & {
        currentTarget: HTMLInputElement
        target: HTMLInputElement
    }) => {
        if (event.target.files) {
            setImportFile(event.target.files[0])
        }
    }

    return (
        <div id="transactions" class="mt-8 border-t border-border pt-6">
            <div id={"header"} class="mb-5 flex items-center justify-between">
                <div class={"text-start"}>
                    <h3 class="mb-1 text-base font-semibold">
                        Transaction data
                    </h3>
                    <span class="text-sm text-foreground/50">
                        Import or export transactions for this project.
                    </span>
                </div>

                <span class="rounded-full bg-background px-3 py-1 text-xs text-foreground/60">
                    {transactions()?.length ?? 0} transactions
                </span>
            </div>
            <div class={"flex flex-col gap-4"}>
                <label for={"file-upload"} class={"flex flex-col items-center"}>
                    <input
                        ref={fileInput}
                        type="file"
                        accept=".json,application/json"
                        class={[
                            "file:mr-3 file:border-0 file:bg-accent file:rounded-l-md file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent/90 file:cursor-pointer",
                            "block min-w-0 w-full mb-8 max-w-full rounded-md border border-border bg-background text-sm cursor-pointer"
                        ]}
                        onChange={onFileChange}
                    />
                </label>
                <div id={"upload-controls"} class={"flex gap-4 justify-start"}>
                    <button
                        type="button"
                        class="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!importFile()} onClick={importTransactions}>
                        Import
                    </button>

                    <button
                        type="button"
                        class="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!transactions()?.length} onClick={exportTransactions}>
                        Export
                    </button>
                </div>
            </div>
        </div>
    )
}

function DangerZone(props: { projectId: number, refresh: () => void }) {
    const [deleteButtonText, setDeleteButtonText] = createSignal<string>("Delete Project");

    async function deleteProject() {
        if (deleteButtonText() === "Delete Project") {
            setDeleteButtonText("Confirm Deletion");
            return;
        }

        const response = await fetch(
            `/api/project/${props.projectId}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            toast.error("Error deleting Project")
            return;
        }

        toast.success("Deleted Project")
        props.refresh()
    }

    return (
        <div id="dangerZone" class="mt-8 border-t border-border pt-6">
            <div class="mb-4 min-w-0 text-start">
                <h3 class="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">
                    Danger zone
                </h3>

                <span class="block text-sm text-foreground/50">
            Deleting this project is permanent and cannot be undone.
        </span>
            </div>

            <button
                type="button"
                class="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                onClick={deleteProject}
            >
                {deleteButtonText()}
            </button>
        </div>
    )
}