import {IProject} from "../interfaces";
import {createMemo, createSignal, For, Loading} from "solid-js";
import {CreateProject} from "../components/models/createProject";
import {EmptyProjectCard, NumberCard, ProjectCard, SkeletonCard} from "../components/Cards";

export default function Home() {
    const [projectFormOpen, setProjectFormOpen] = createSignal<boolean>(false)

    const spendBudget = createMemo(() => fetchTotalSpendBudget())
    const projects = createMemo(() => fetchProjects());
    const projectBudget = createMemo(() => calculateTotalProjectBudget())
    const availableBudget = createMemo(() => calculateTotalAvailableBudget())

    async function fetchProjects(): Promise<IProject[]> {
        const response = await fetch("/api/projects");
        if (!response.ok) {
            return [];
        }
        return response.json();
    }

    function calculateTotalProjectBudget(): number {
        let totalBudget: number = 0
        for (let i = 0; i < projects().length; i++) {
            totalBudget = totalBudget + projects()[i].budget
        }
        return totalBudget
    }

    function calculateTotalAvailableBudget(): number {
        let totalBudget: number = 0
        for (let i = 0; i < projects().length; i++) {
            totalBudget = totalBudget + projects()[i].available_budget
        }
        return totalBudget
    }

    async function fetchTotalSpendBudget(): Promise<number> {
        const response = await fetch("/api/projects/spend");
        if (!response.ok) {
            return 0;
        }
        const responseData: { value: number } = await response.json()
        return responseData.value
    }

    function toggleProjectFormOpen(): void {
        setProjectFormOpen(!projectFormOpen)
    }

    return (
        <main class="w-full flex flex-col items-start pt-12">
            <CreateProject open={projectFormOpen()} toggle={toggleProjectFormOpen}/>
            <h2>Overview</h2>
            <div class={"w-full grid grid-cols-4 gap-4 mb-8"}>
                <Loading fallback={<SkeletonCard/>}>
                    <NumberCard title={"Total Budget (Monthly)"} value={projectBudget()} currency={true}/>
                </Loading>
                <Loading fallback={<SkeletonCard/>}>
                    <NumberCard title={"Total Spend Budget"} value={spendBudget()} currency={true}/>
                </Loading>
                <Loading fallback={<SkeletonCard/>}>
                    <NumberCard title={"Total Available Budget"} value={availableBudget()} currency={true}/>
                </Loading>
                <Loading fallback={<SkeletonCard/>}>
                    <NumberCard title={"Active Projects"} value={projects().length} currency={false}/>
                </Loading>
            </div>
            <h2>Projects</h2>
            <div class={"w-full grid grid-cols-3 xl:grid-cols-4 gap-4 mb-8"}>
                <Loading fallback={<SkeletonCard class={"min-h-80"}/>}>
                    <For each={projects()} fallback={<div>No items</div>}>
                        {(item) => <ProjectCard project={item}/>}
                    </For>
                    <EmptyProjectCard open={() => setProjectFormOpen(true)}/>
                </Loading>
            </div>
        </main>
    );
}
