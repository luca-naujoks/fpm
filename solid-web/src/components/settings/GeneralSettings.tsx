import {createMemo, createSignal, Show} from "solid-js";
import {getLightModeFromLocalStorage} from "../../utils/lightMode";

export function GeneralSettings() {
    const [lightMode, setLightMode] = createSignal<boolean>(getLightModeFromLocalStorage)

    const hasChanges = createMemo(() => false);

    function handleLightModeToggle(currentState: boolean) {
        setLightMode(!currentState)
        document.documentElement.classList.toggle("dark", lightMode());
        localStorage.setItem("light_mode", String(!currentState))
    }

    return (
        <section data-testid={"general_settings_container"} class="rounded-xl border border-border bg-surface col-span-3">
            <header class="border-b border-border px-6 py-5">
                <div class="flex items-center justify-between gap-4">
                    <div class="text-start">
                        <div class="flex items-center gap-4">
                            <h2 class="mb-0 truncate text-xl font-semibold">
                                General Settings
                            </h2>

                            <span class="rounded-md bg-background px-2 py-1 font-mono text-xs text-foreground/50">
                                #0
                            </span>
                        </div>

                        <span class="mt-1 text-sm text-foreground/50">
                            General Application Settings
                        </span>
                    </div>

                    <Show when={hasChanges()}>
                        <span class="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                            Unsaved
                        </span>
                    </Show>
                </div>
            </header>

            <div class="p-6">
                <div class="flex flex-col gap-6">
                    <div class={"flex items-center gap-2"}>
                        <input
                            data-testid={"light_mode_checkbox"}
                            type="checkbox"
                            checked={lightMode()}
                            placeholder="Home Lab"
                            class="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-accent/20"
                            onInput={() => handleLightModeToggle(lightMode())}
                        />
                        <label class={"flex"}>
                            Light Mode
                        </label>
                    </div>
                </div>
            </div>
        </section>
    )
}