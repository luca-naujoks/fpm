import {type JSX} from "react";

export function GeneralSettings(): JSX.Element {
    return (
        <div>
            <h1 className={"mb-2"}>General Settings</h1>
            <button className={"button mr-2"}>Import from JSON</button>
            <button className={"button"}>Export as JSON</button>
        </div>
    )
}