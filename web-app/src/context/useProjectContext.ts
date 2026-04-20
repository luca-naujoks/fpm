import {createContext, useContext} from "react";
import type {IProject} from "../interfaces.ts";

interface IProjectContext {
    projects: IProject[]
    selectedProject: IProject | undefined
    projectRefresh: () => void
    setSelectedProject: (project: IProject | undefined) => void
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const ProjectContext = createContext<IProjectContext>(null)
export const useProject: () => IProjectContext = (): IProjectContext => useContext(ProjectContext)