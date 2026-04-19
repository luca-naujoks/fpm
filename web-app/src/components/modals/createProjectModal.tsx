import './modals.css'
import {type JSX, useState} from "react";
import type {IProject} from "../../interfaces.ts";
import {ModalWrapper} from "./wrapper.tsx";

interface createProjectProps {
    modalOpen: boolean
    closeMoal: () => void
    projectRefetch: () => void
}

export function CreateProjectModal({modalOpen, closeMoal, projectRefetch}: createProjectProps): JSX.Element {
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
        closeMoal()
        projectRefetch()
    }

    return (
        <ModalWrapper modalOpen={modalOpen} closeModal={closeMoal}>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <h1 className={"modalHeading"}>Create Project</h1>
            <p className={"modalDescription"}>Create your Side Project. Click Save to create it.</p>
            <label htmlFor="">Project Name</label>
            <input type="text" placeholder={"Home Lab"} onChange={(e) => setName(e.target.value)}/>
            <label htmlFor="">Project Description</label>
            <input type="text" placeholder={"Stuff in my Rack"} onChange={(e) => setDescription(e.target.value)}/>
            <label htmlFor="">Project Budget</label>
            <input type="number" placeholder={"20"} defaultValue={20} onChange={(e) => setBudget(e.target.value)}/>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"button"} onClick={() => closeMoal()}>Cancel</button>
                <button className={"button"} onClick={() => submitProject()}>Create Project</button>
            </div>
        </ModalWrapper>
    )
}