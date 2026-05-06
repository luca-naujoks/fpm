import './modals.css'
import {type ReactNode, useEffect, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {ModalWrapper} from "./wrapper.tsx";
import {useProject} from "../../context/projectContext/useProjectContext.ts";
import {CloseButton} from "../CloseButton.tsx";

export function CreateProjectModal(): ReactNode {
    const {projectRefresh, createModalOpen, toggleCreateModal} = useProject()

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [budget, setBudget] = useState<string>("20")
    const budgetAsNumber: number = Number(budget)

    const [error, setError] = useState<string>("")

    async function submitProject() {
        const project: IProject = {
            id: 0,
            name: name,
            description: description,
            budget: budgetAsNumber
        }
        const response = await fetch("/api/project", {method: "POST", body: JSON.stringify(project)})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        toggleCreateModal()
        projectRefresh()
    }

    useEffect((): void => {
        setName("")
        setDescription("")
        setBudget("20")
        setError("")
    }, [createModalOpen]);

    return (
        <ModalWrapper modalOpen={createModalOpen} closeModal={toggleCreateModal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <div className={"w-full flex justify-between items-start"}>
                <h1 className={"modalHeading"}>Create Project</h1>
                <CloseButton onClick={toggleCreateModal}/>
            </div>
            <p className={"modalDescription"}>Create your Side Project. Click Save to create it.</p>
            <label htmlFor="">Project Name</label>
            <input type="text" placeholder={"Home Lab"} onChange={(e) => setName(e.target.value)}/>
            <label htmlFor="">Project Description</label>
            <input type="text" placeholder={"Stuff in my Rack"} onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Project Budget</label>
            <input type="number" placeholder={"20"} defaultValue={20} onChange={(e) => setBudget(e.target.value)}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={() => toggleCreateModal()}>Cancel</button>
                <button className={"button"} onClick={() => submitProject()}>Create Project</button>
            </div>
        </ModalWrapper>
    )
}