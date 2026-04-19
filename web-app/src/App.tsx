import './App.css'
import {Sidebar} from "./components/sidebar/sidebar.tsx";
import {useEffect, useState} from "react";
import type {IProject} from "./interfaces.ts";
import {TransactionBody} from "./components/transactionBody/TransactionBody.tsx";

function App() {
    const [currentNav, setCurrentNav] = useState<IProject>()
    const [projects, setProjects] = useState<IProject[]>([])

    async function fetchProjects(): Promise<IProject[]> {
        const response = await fetch("/api/projects", {method: "GET"})
        return await response.json()
    }

    function refetchProjects(): void {
        fetchProjects().then((projects: IProject[]) => setProjects(projects))
    }

    useEffect(() => {
        fetchProjects().then((projects: IProject[]) => setProjects(projects))
    }, []);


    return (
        <div className={"grid grid-cols-9"}>
            <section className={"col-span-1"}>
                <Sidebar projects={projects} setNavigation={setCurrentNav} selectedProject={currentNav}
                         projectRefetch={refetchProjects}/>
            </section>
            <section className={"col-span-8 p-4"}>
                <TransactionBody project={currentNav}/>
            </section>
        </div>
    )
}

export default App
