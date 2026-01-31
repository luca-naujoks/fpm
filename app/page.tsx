"use client"
import {ProjectComponent} from "@/components/projects";
import {TransactionComponent} from "@/components/transactions";
import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/dist/client/components/navigation";
import {getProject} from "@/app/actions";
import {project} from "@/interfaces";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectsPage/>
        </Suspense>
    )
}

function ProjectsPage() {
    const projectId = useSearchParams().get("project")
    const id = projectId != null ? parseInt(projectId) : 0
    const [selectedProject, setSelectedProject] = useState<project>({} as project)


    useEffect(() => {
        async function fetch(): Promise<void> {
            const projects = await getProject(id)
            setSelectedProject(projects)
        }

        fetch()
    }, []);


    return (
        <div className="max-w-screen max-h-screen h-screen p-8">
            <h1 className="text-2xl pb-4 font-bold h-[5%]">Project Financial Manager</h1>


            <div className={"flex gap-2 h-[90%]"}>
                <ProjectComponent selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                <TransactionComponent project={selectedProject}/>
            </div>
        </div>
    );
}

