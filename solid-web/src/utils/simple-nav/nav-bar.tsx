import {Router} from "../../router";
import {createMemo, createSignal, For, Show} from "solid-js";
import {useLocation} from "@solidjs/router";
import {toast} from "../simple-toast/toaster";
import {IProjectSettings} from "../../interfaces";

const [pinnedProjectsRefresh, setPinnedProjectsRefresh] = createSignal<boolean>(false)
const pinnedProjects = createMemo<IProjectSettings[]>(() => {
    pinnedProjectsRefresh()

    return fetchPinnedProjects()
})

export const navigationBar = {
    refresh() {
        setPinnedProjectsRefresh((prev) => !prev)
    }
}

async function fetchPinnedProjects(): Promise<IProjectSettings[]> {
    const response = await fetch("/api/projects/pinned")
    if (!response.ok) {
        toast.error("Failed to fetch Pinned Projects")
        return []
    }

    return response.json()
}

export function Navigation() {
    const location = useLocation()


    return (
        <nav class={"nav"} data-testid={"nav_bar"}>
            <a href={Router.paths()} class={location.pathname == "/" ? "text-accent/50 cursor-default" : ""}
               data-testid={"nav_home"}>Home</a>
            <span class={"w-1 border-l-2 border-border"}/>
            <Show when={pinnedProjects().length > 0}>
                <>
                    <For each={pinnedProjects()}>
                        {(route) =>
                            <a href={`/project/${route.id}`}
                               class={location.pathname == `/project/${route.id}` ? "text-accent/50 cursor-default" : ""}>{route.title}</a>}
                    </For>
                    <span class={"w-1 border-l-2 border-border"}/>
                </>
            </Show>
            <a href={Router.paths.settings}
               class={location.pathname == "/settings" ? "text-accent/50 cursor-default" : ""}
               data-testid={"nav_settings"}>Settings</a>
        </nav>
    )
}