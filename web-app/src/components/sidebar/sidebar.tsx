import './sidebar.css'
import {type JSX, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {CreateProjectModal} from "../modals/createProjectModal.tsx";
import {Settings} from "../settings/settings.tsx";

export interface sidebarProps {
    selectedProject: IProject | undefined
    projects: IProject[]
    setNavigation: (project: IProject | undefined) => void
    projectRefetch: () => void
}

export function Sidebar({selectedProject, projects, setNavigation, projectRefetch}: sidebarProps): JSX.Element {
    const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false)

    return (
        <>
            <CreateProjectModal modalOpen={createProjectModalOpen} closeMoal={() => setCreateProjectModalOpen(false)}
                                projectRefetch={projectRefetch}/>
            <Settings projects={projects} modalOpen={settingsModalOpen} closeModal={() => setSettingsModalOpen(false)} projectRefetch={projectRefetch}/>
            <div className={"flex flex-col h-screen w-fit p-4 border-r-2 border-neutral-700"}>
                <div className={"flex justify-between items-end gap-4 mb-4"}>
                    <h1>Projects</h1>
                    <button className={"button"} onClick={() => setCreateProjectModalOpen(true)}>+ Add
                    </button>
                </div>
                <button className={"button"} onClick={() => setNavigation(undefined)}
                        disabled={selectedProject == undefined}>Home Overview
                </button>
                <p className={"mb-2 mt-1 border-b-2 border-neutral-700"}/>
                <div className={"flex flex-col grow"}>
                    {projects.map((project: IProject) => (
                        <button key={project.id} className={"button"}
                                onClick={() => setNavigation(project)}
                                disabled={project.id == selectedProject?.id}>{project.name}</button>
                    ))}
                </div>
                <button className={"button"} onClick={() => setSettingsModalOpen(true)}>Settings
                </button>
            </div>
        </>
    )
}