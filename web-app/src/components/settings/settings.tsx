import {type JSX, type ReactNode, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {ProjectSettings} from "./ProjectSettings.tsx";
import {GeneralSettings} from "./GeneralSettings.tsx";
import {useProject} from "../../context/useProjectContext.ts";

interface settingsProps {
    modalOpen: boolean
    closeModal: () => void
}

export function Settings({modalOpen, closeModal}: settingsProps): JSX.Element {
    const {projects} = useProject()
    const [navigation, setNavigation] = useState<IProject | "general">("general")

    return (
        <ModalBackground modalOpen={modalOpen} closeModal={closeModal}>
            <div className={"flex flex-col h-2/3 w-2/3 p-4 bg-(--bg) border-2 border-(--border) rounded-md"}
                 onClick={(event) => event.stopPropagation()}>
                <div className={"flex justify-between mb-4"}>
                    <h1>Settings</h1>
                    <button className={"button"} onClick={closeModal}>X</button>
                </div>
                <div className={"flex gap-4 h-full"}>
                    <div className={"flex flex-col h-full w-48"}>
                        <button className={"button"} onClick={() => setNavigation("general")}
                                disabled={navigation == "general"}>General
                        </button>
                        <p className={"mb-2 mt-1 border-b-2 border-neutral-700"}/>
                        <div className={"flex flex-col grow gap-2"}>
                            {projects.map((project: IProject) => (
                                <button key={project.id} className={"button"}
                                        onClick={() => setNavigation(project)}
                                        disabled={project == navigation}>{project.name}</button>
                            ))}
                        </div>
                    </div>
                    <p className={"h-full border-r-2 border-neutral-700"}/>
                    <div className={"w-full"}>
                        <BodySwitch navigation={navigation} returnToGeneral={() => setNavigation("general")}/>
                    </div>
                </div>
            </div>
        </ModalBackground>
    )
}

interface PBodyProps {
    navigation: IProject | "general"
    returnToGeneral: () => void
}

function BodySwitch({navigation, returnToGeneral}: PBodyProps): JSX.Element {
    switch (navigation) {
        case "general":
            return <GeneralSettings/>
        default:
            return <ProjectSettings key={navigation.id || "general"} project={navigation}
                                    returnToGeneral={returnToGeneral}/>
    }
}

function ModalBackground({children, modalOpen, closeModal}: {
    children: ReactNode,
    modalOpen: boolean,
    closeModal: () => void
}) {
    return (
        <div onClick={closeModal}
             className={modalOpen ? "flex items-center justify-center absolute top-0 left-0 w-screen h-screen  bg-(--code-bg)/50" : "hidden"}>
            {children}
        </div>
    )
}