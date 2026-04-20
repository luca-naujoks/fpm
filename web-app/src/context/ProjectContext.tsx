import {type JSX, type ReactNode, useEffect, useState} from "react";
import type {IProject} from "../interfaces.ts";
import {ProjectContext} from "./useProjectContext.ts";


export const ProjectProvider = ({children}: { children: ReactNode }): JSX.Element => {
    const [projects, setProjects] = useState<IProject[]>([])
    const [selectedProjects, setSelectedProjects] = useState<IProject | undefined>(undefined)

    async function fetchProjects(): Promise<IProject[]> {
        const response = await fetch("/api/projects", {method: "GET"})
        return await response.json()
    }

    function refetchProjects(): void {
        fetchProjects().then((projects: IProject[]) => setProjects(projects))
    }

    useEffect(() => {
        fetchProjects().then((projects: IProject[]) => setProjects(projects))
    }, []);

    return (
        <ProjectContext value={{
            projects: projects,
            selectedProject: selectedProjects,
            setSelectedProject: (project: IProject | undefined) => setSelectedProjects(project),
            projectRefresh: () => refetchProjects()
        }}>{children}</ProjectContext>
    )
}