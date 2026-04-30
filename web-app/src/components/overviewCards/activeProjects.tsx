import {type JSX} from "react";
import {useProject} from "../../context/projectContext/useProjectContext.ts";

export function ActiveProjects(): JSX.Element {
    const {projects} = useProject()

    return (
        <div className={"card"}>
            <h2>Active Projects</h2>
            <h1>{projects.length}</h1>
        </div>
    )
}