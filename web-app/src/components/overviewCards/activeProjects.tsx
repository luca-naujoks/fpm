import './cards.css'
import {type JSX, useEffect, useState} from "react";
import type {IProject} from "../../interfaces.ts";

export function ActiveProjects(): JSX.Element {
    const [projects, setProjects] = useState<number>(0)

    async function fetchProjects(): Promise<number> {
        const projectResponse = await fetch("/api/projects", {method: "GET"})
        const projects: IProject[] = await projectResponse.json()
        return projects.length
    }

    useEffect(() => {
        fetchProjects().then((projects: number) => setProjects(projects))
    }, []);

    return (
        <div className={"card"}>
            <h2>Active Projects</h2>
            <h1>{projects}</h1>
        </div>
    )
}