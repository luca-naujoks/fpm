import {type ReactNode} from "react";

export function GeneralSettings(): ReactNode {
    return (
        <div>
            <h1 className={"mb-2"}>General Settings</h1>
            <p>Use the Sidebar in the Settings Container to navigate projects, allowing you to Modify or Import/Export
                their transactions.</p>
            <p className={"border border-(--border) my-4"}/>
            <p className={"text-center"}>Maybe future application global settings</p>
        </div>
    )
}