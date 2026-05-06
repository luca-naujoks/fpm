import {type ReactNode, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {Settings} from "../settings/settings.tsx";
import {useProject} from "../../context/projectContext/useProjectContext.ts";
import {useSidebar} from "../../context/sidebarContext/useSidebarContext.ts";

export function Sidebar(): ReactNode {
    const {projects, selectedProject, setSelectedProject, toggleCreateModal} = useProject()
    const {sidebarOpen} = useSidebar()

    const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false)

    return (
        <>
            <Settings modalOpen={settingsModalOpen} closeModal={() => setSettingsModalOpen(false)}/>
            <div
                className={`flex-col h-[95%] lg:h-screen w-fit p-4 border-r-2 border-(--border) ${sidebarOpen ? "flex" : "hidden"}`}>
                <div className={"hidden lg:flex justify-between items-end gap-4 mb-4"}>
                    <h1 className={""}>Projects</h1>
                    <button className={"button"} onClick={() => toggleCreateModal()}>+ Add
                    </button>
                </div>
                <div className={"flex flex-col h-full w-full gap-2"}>
                    <button className={"button lg:hidden"} onClick={() => toggleCreateModal()}>+ Add
                    </button>
                    <button className={"button"} onClick={() => setSelectedProject(undefined)}
                            disabled={selectedProject == undefined}>Overview
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
