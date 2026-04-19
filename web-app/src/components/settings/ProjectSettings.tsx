import type {IProject} from "../../interfaces.ts";
import {type JSX, useState} from "react";

interface PProjectProps {
    project: IProject
    returnToGeneral: () => void,
    projectRefetch: () => void
}

export function ProjectSettings({project, returnToGeneral, projectRefetch}: PProjectProps): JSX.Element {
    const [name, setName] = useState<string>(project.name)
    const [description, setDescription] = useState<string>(project.description)
    const [budget, setBudget] = useState<string>(project.budget.toString())
    const budgetAsNumber: number = Number(budget)

    const [error, setError] = useState<string>("")
    const [positiveFeedback, setPositiveFeedback] = useState<string>("")

    const [deleteButtonText, setDeleteButtonText] = useState<string>("Delete Project")

    const disableUpdateButton = name == project.name && description == project.description && budgetAsNumber == project.budget

    async function updateProject() {
        const body: IProject = {
            id: project.id,
            name: name,
            description: description,
            budget: budgetAsNumber
        }
        const response = await fetch("/api/project", {method: "PUT", body: JSON.stringify(body)})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        setPositiveFeedback(data.toString())
    }

    async function deleteProject() {
        if (deleteButtonText == "Delete Project") {
            setDeleteButtonText("Confirm Deletion")
            return
        }

        const response = await fetch(`/api/project?projectId=${project.id}`, {method: "DELETE"})
        const data = await response.json()
        if (!response.ok) {
            setError(data)
            return
        }
        returnToGeneral()
        projectRefetch()
    }


    return (
        <div>
            <p className={error == "" ? "hidden" : ""}>{error}</p>
            <p className={positiveFeedback == "" ? "hidden" : "w-fit p-2 bg-green-800 rounded-md cursor-pointer"}
               onClick={() => setPositiveFeedback("")}>{positiveFeedback}</p>
            <div>
                <label htmlFor="">Project Id</label>
                <input type="text" placeholder={"Home Lab"} value={project.id} disabled/>
                <label htmlFor="">Project Name</label>
                <input type="text" placeholder={"Home Lab"} value={name}
                       onChange={(e) => setName(e.target.value)}/>
                <label htmlFor="">Project Description</label>
                <input type="text" placeholder={"Stuff in my Rack"} value={description}
                       onChange={(e) => setDescription(e.target.value)}/>
                <label htmlFor="">Project Budget</label>
                <input type="number" placeholder={"20"} value={budget}
                       onChange={(e) => setBudget(e.target.value)}/>
            </div>
            <div className={"flex gap-4 justify-end mt-8"}>
                <button className={"dangerButton"} onClick={() => deleteProject()}>{deleteButtonText}</button>
                <button className={"button"} onClick={() => updateProject()} disabled={disableUpdateButton}>Update
                    Project
                </button>
            </div>
        </div>
    )
}