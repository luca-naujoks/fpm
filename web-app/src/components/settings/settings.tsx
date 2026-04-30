import {type JSX, type ReactNode, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {ProjectSettings} from "./ProjectSettings.tsx";
import {GeneralSettings} from "./GeneralSettings.tsx";
import {useProject} from "../../context/projectContext/useProjectContext.ts";

interface settingsProps {
    modalOpen: boolean
    closeModal: () => void
}

export function Settings({modalOpen, closeModal}: settingsProps): JSX.Element {
    const {projects} = useProject()
    const [navigation, setNavigation] = useState<IProject | "general">("general")

    const [error, setError] = useState<string>("")
    const [positiveFeedback, setPositiveFeedback] = useState<string>("")

    return (
        <ModalBackground modalOpen={modalOpen} closeModal={closeModal}>
            <div className={"flex flex-col h-2/3 w-2/3 p-4 bg-(--social-bg) border-2 border-(--border) rounded-md"}
                 onClick={(event) => event.stopPropagation()}>
                <div className={"flex justify-between mb-4"}>
                    <h1>Settings</h1>
                    <>
                        <p className={error == "" ? "hidden" : "w-fit h-6 px-1 bg-red-800 rounded-md truncate cursor-pointer"}
                           onClick={() => setError("")}>{error}</p>
                        <p className={positiveFeedback == "" ? "hidden" : "w-fit h-6 px-1 bg-green-800 rounded-md truncate cursor-pointer"}
                           onClick={() => setPositiveFeedback("")}>{positiveFeedback}</p>
                    </>
                    <button className={"button"} onClick={closeModal}>x</button>
                </div>
                <div className={"flex gap-4 h-full"}>
                    <div className={"flex flex-col h-full w-48 gap-2"}>
                        <button className={"button"} onClick={() => setNavigation("general")}
                                disabled={navigation == "general"}>General
                        </button>
                        <p className={"border-b-2 border-(--border)"}/>
                        <div className={"flex flex-col grow gap-2"}>
                            {projects.map((project: IProject) => (
                                <button key={project.id} className={"button"}
                                        onClick={() => setNavigation(project)}
                                        disabled={project == navigation}>{project.name}</button>
                            ))}
                        </div>
                    </div>
                    <p className={"h-full border-r-2 border-(--border)"}/>
                    <div className={"w-full overflow-scroll max-h-2/3"}>
                        <BodySwitch navigation={navigation} returnToGeneral={() => setNavigation("general")}
                                    setError={setError} setPositiveFeedback={setPositiveFeedback}/>
                    </div>
                </div>
            </div>
        </ModalBackground>
    )
}

interface PBodyProps {
    navigation: IProject | "general"
    returnToGeneral: () => void
    setError: (message: string) => void
    setPositiveFeedback: (message: string) => void
}

function BodySwitch({navigation, returnToGeneral, setError, setPositiveFeedback}: PBodyProps): JSX.Element {
    switch (navigation) {
        case "general":
            return <GeneralSettings/>
        default:
            return <ProjectSettings key={navigation.id || "general"} project={navigation}
                                    returnToGeneral={returnToGeneral} setError={setError}
                                    setPositiveFeedback={setPositiveFeedback}/>
    }
}

function ModalBackground({children, modalOpen, closeModal}: {
    children: ReactNode,
    modalOpen: boolean,
    closeModal: () => void
}) {
    return (
        <div onClick={closeModal}
             className={modalOpen ? "flex items-center justify-center absolute top-0 left-0 w-screen h-screen  bg-(--social-bg)/50" : "hidden"}>
            {children}
        </div>
    )
}