import {IProject} from "../../interfaces";

export function NavButton(props: {
    project: IProject,
    setSelectedProjectId: (value: number) => number
}) {
    return (
        <button
            type="button"
            class={`w-full rounded-md px-3 py-3 text-left transition text-foreground hover:bg-surface-elevated/50 cursor-pointer`}
            onClick={() => props.setSelectedProjectId(props.project.id)}
        >
            <div class="truncate text-sm font-medium">
                {props.project.title}
            </div>

            <div class={`mt-0.5 truncate text-xs text-foreground/40`}>
                # {props.project.description}
            </div>
        </button>
    )
}