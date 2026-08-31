import {IProject} from "../interfaces";
import {createMemo, createSignal, For, Loading, Match, Switch} from "solid-js";
import {GeneralSettings} from "../components/settings/GeneralSettings";
import {ProjectSettings} from "../components/settings/ProjectSettings";
import {NavButton} from "../components/settings/NavButton";
import {toast} from "../utils/simple-toast/toaster";

export default function Settings() {
    const [selectedProjectId, setSelectedProjectId] = createSignal<number>(0);
    const [projectRefresh, setProjectRefresh] = createSignal<number>(0)

    const projects = createMemo(() => {
        projectRefresh()

        return fetchProjects()
    });
    const selectedProject = createMemo(() => findProjectById());

    async function fetchProjects(): Promise<IProject[]> {
        const response = await fetch("/api/projects");
        if (!response.ok) {
            toast.error("Error fetching Projects")
            return [];
        }
        return response.json();
    }

    function findProjectById(): IProject | undefined {
        return projects()?.find(
            project => project.id === selectedProjectId()
        )
    }

    function selectGeneralSettings() {
        setSelectedProjectId(0)
    }

    function refresh(): void {
        setProjectRefresh(v => v + 1)
    }

    return (
        <Loading>
            <main class="w-full mt-4 mb-8">
                <div class="flex flex-col gap-6 lg:grid lg:grid-cols-4">
                    <aside data-testid={"settings_navigation"} class="rounded-xl border border-border bg-surface">
                        <div class="border-b border-border px-4 py-4">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-foreground/60">
                                Projects
                            </h3>
                        </div>

                        <nav class="flex flex-col gap-2 p-2">
                            <GeneralSettingsNavButton selectGeneralProject={selectGeneralSettings}/>
                            <span class={"border-b border-border"}/>

                            <Loading fallback={<NavButtonSkeleton/>}>
                                <For each={projects()}>
                                    {(project) => (
                                        <NavButton project={project} setSelectedProjectId={setSelectedProjectId}/>
                                    )}
                                </For>
                            </Loading>
                        </nav>
                    </aside>
                    <Switch>
                        <Match when={!selectedProject()}>
                            <GeneralSettings/>
                        </Match>
                        <Match when={selectedProject()}>
                            {(project) => <ProjectSettings project={project()} refetch={refresh}/>}
                        </Match>
                    </Switch>
                </div>
            </main>
        </Loading>
    );
}

function GeneralSettingsNavButton(props: { selectGeneralProject: () => void }) {
    return (
        <button
            data-testid={"general_settings_nav_button"}
            type="button" onClick={() => props.selectGeneralProject()}
            class={`w-full rounded-md px-3 py-3 text-left transition text-foreground hover:bg-surface-elevated/50 cursor-pointer`}
        >
            <div class="truncate text-sm font-medium">
                General Settings
            </div>
        </button>
    )
}

function NavButtonSkeleton() {
    return (
        <button
            type="button"
            class={`w-full h-12 bg-surface-elevated/50 rounded-md p-3 text-left transition animate-pulse cursor-pointer`}
        />
    )
}



