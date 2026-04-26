import {type JSX, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {CreateProjectModal} from "../modals/createProjectModal.tsx";
import {Settings} from "../settings/settings.tsx";
import {useProject} from "../../context/useProjectContext.ts";

export function Sidebar(): JSX.Element {
    const {projects, selectedProject, setSelectedProject} = useProject()

    const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false)

    return (
        <>
            <CreateProjectModal modalOpen={createProjectModalOpen} closeModal={() => setCreateProjectModalOpen(false)}/>
            <Settings modalOpen={settingsModalOpen} closeModal={() => setSettingsModalOpen(false)}/>
            <div className={"flex flex-col h-screen w-fit p-4 border-r-2 border-(--border)"}>
                <div className={"flex justify-between items-end gap-4 mb-4"}>
                    <h1>Projects</h1>
                    <button className={"button"} onClick={() => setCreateProjectModalOpen(true)}>+ Add
                    </button>
                </div>
                <div className={"flex flex-col h-full w-full gap-2"}>
                    <button className={"button"} onClick={() => setSelectedProject(undefined)}
                            disabled={selectedProject == undefined}>Home Overview
                    </button>
                    <p className={"border-b-2 border-(--border)"}/>
                    <div className={"flex flex-col grow gap-2"}>
                        {projects.map((project: IProject) => (
                            <button key={project.id} className={"button"}
                                    onClick={() => setSelectedProject(project)}
                                    disabled={project.id == selectedProject?.id}>{project.name}</button>
                        ))}
                    </div>
                    <button className={"button"} onClick={() => setSettingsModalOpen(true)}>Settings
                    </button>
                </div>
            </div>
        </>
    )
}