import {Router} from "../../router";
import {createSignal, For, Show} from "solid-js";
import {useLocation} from "@solidjs/router";

export type NavigationItem = {
    title: string
    route: string
}

const [additionalRoutes, setAdditionalRoutes] = createSignal<NavigationItem[]>([])
export const navigation = {
    push(r: string, t: string): void {
        const newRoute: NavigationItem = {
            route: r,
            title: t
        }
        if (additionalRoutes().some(route => route.route === r)) {
            return
        }

        if (additionalRoutes().length >= 2) {
            additionalRoutes().shift()
        }

        setAdditionalRoutes((prev) => [...prev, newRoute])
    }
}

export function Navigation() {
    const location = useLocation()

    return (
        <nav class={"nav"}>
            <a href={Router.paths()} class={location.pathname == "/" ? "text-accent/50 cursor-default" : ""}>Home</a>
            <span class={"w-1 border-l-2 border-border"}/>
            <Show when={additionalRoutes().length > 0}>
                <>
                    <For each={additionalRoutes()}>
                        {(route) =>
                            <a href={route.route}
                               class={location.pathname == route.route ? "text-accent/50 cursor-default" : ""}>{route.title}</a>}
                    </For>
                    <span class={"w-1 border-l-2 border-border"}/>
                </>
            </Show>
            <a href={Router.paths.settings}
               class={location.pathname == "/settings" ? "text-accent/50 cursor-default" : ""}>Settings</a>
        </nav>
    )
}