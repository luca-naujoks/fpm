import type {IProject, ITransaction} from "../../interfaces.ts";
import {type ChangeEvent, type ReactNode, useCallback, useEffect, useState} from "react";
import {useProject} from "../../context/projectContext/useProjectContext.ts";

interface PProjectProps {
    project: IProject
    returnToGeneral: () => void,
    setError: (message: string) => void
    setPositiveFeedback: (message: string) => void
}

export function ProjectSettings({project, returnToGeneral, setError, setPositiveFeedback}: PProjectProps): ReactNode {
    const {projectRefresh} = useProject()
    const [name, setName] = useState<string>(project.name)
    const [description, setDescription] = useState<string>(project.description)
    const [budget, setBudget] = useState<string>(project.budget.toString())
    const budgetAsNumber: number = Number(budget)

    const [importFile, setImportFile] = useState<File>()
    const [transactions, setTransactions] = useState<ITransaction[]>([])


    const [deleteButtonText, setDeleteButtonText] = useState<string>("Delete Project")

    const disableUpdateButton: boolean = name == project.name && description == project.description && budgetAsNumber == project.budget

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
        setError("")
        setPositiveFeedback(data.toString())
        projectRefresh()
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
        projectRefresh()
    }

    const onFileChange = (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        if (event.target.files) {
            setImportFile(event.target.files[0])
        }
    }

    async function importTransactions() {
        if (!importFile) {
            return
        }
        try {
            const fileText: string = await importFile.text()
            const jsonContent: ITransaction[] = JSON.parse(fileText)

            const requestBody: { project_id: number, transactions: ITransaction[] } = {
                project_id: project.id,
                transactions: jsonContent
            }

            const response = await fetch("/api/transaction/import", {method: "PUT", body: JSON.stringify(requestBody)})
            if (!response.ok) {
                setError("Error Importing Transactions")
                return
            }
            setImportFile(undefined)
            setError("")
            setPositiveFeedback("Successfully imported Transactions")
            return
        } catch {
            setError("failed parsing JSON file please verify input")
            return
        }
    }

    async function exportTransactions() {
        try {
            const response = await fetch(`/api/transaction/export?project_id=${project.id}`, {method: "GET"})
            if (!response.ok) {
                setError("error Exporting Transactions")
                return
            }
            const data = await response.json()

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            setPositiveFeedback("Transactions exported successfully")
        } catch {
            setError("Error exporting transactions")
        }
    }

    const fetchProjectTransactions: () => Promise<ITransaction[]> = useCallback(async (): Promise<ITransaction[]> => {
        const response = await fetch(`/api/transactions?projectId=${project.id}`)
        return await response.json()
    }, [project])

    useEffect(() => {
        fetchProjectTransactions().then((data: ITransaction[]) => setTransactions(data))
    }, []);


    return (
        <div>
            <h2>Edit Project</h2>
            <div>
                <label htmlFor="">Project Id</label>
                <input type="text" placeholder={"0"} value={project.id} className={"input"} disabled/>
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
                <button className={"button dangerButton"} onClick={() => deleteProject()}>{deleteButtonText}</button>
                <button className={"button"} onClick={() => updateProject()} disabled={disableUpdateButton}>Update
                    Project
                </button>
            </div>
            <p className={"border border-(--border) my-4"}/>
            <div className={"flex flex-col gap-4"}>
                <h2>Import / Export</h2>
                <div className={"flex gap-4"}>
                    <input type={"file"} accept={".json"}
                           className={"w-12 text-base bg-(--social-bg) hover:bg-(--social-bg)/90 border-(--border) border rounded-sm px-2 cursor-pointer"}
                           onChange={onFileChange}/>
                    <button className={"button"} onClick={() => importTransactions()}
                            disabled={!importFile}>Import
                    </button>
                    <button className={"button"} onClick={() => exportTransactions()}
                            disabled={transactions.length <= 0}
                    >Export
                    </button>
                </div>

            </div>
        </div>
    )
}
