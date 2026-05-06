import {type ReactNode, useEffect, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {ProjectContext} from "./useProjectContext.ts";


export const ProjectProvider = ({children}: { children: ReactNode }): ReactNode => {
    const [projects, setProjects] = useState<IProject[]>([])
    const [selectedProject, setSelectedProject] = useState<IProject | undefined>(undefined)

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)

    async function fetchProjects(): Promise<IProject[]> {
        const response = await fetch("/api/projects", {method: "GET"})
        return await response.json()
    }

    function refetchProjects(): void {
        function afterFetch(projects: IProject[]) {
            setProjects(projects)
            if (!selectedProject) {
                return
            }
            const updatedSelectedProject: IProject = projects.filter((project) => project.id == selectedProject.id)[0]
            setSelectedProject(updatedSelectedProject)
        }

        fetchProjects().then((projects: IProject[]) => afterFetch(projects))
    }

    useEffect(() => {
        fetchProjects().then((projects: IProject[]) => setProjects(projects))
    }, []);

    return (
        <ProjectContext value={{
            projects: projects,
            selectedProject: selectedProject,
            setSelectedProject: (project: IProject | undefined) => setSelectedProject(project),
            projectRefresh: () => refetchProjects(),
            createModalOpen: createModalOpen,
            toggleCreateModal: () => setCreateModalOpen(!createModalOpen)
        }}>{children}</ProjectContext>
    )
}