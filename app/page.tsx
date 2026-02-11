"use client"
import {ProjectComponent, ProjectComponentProps} from "@/components/projects";
import {TransactionComponent} from "@/components/transactions";
import React, {Suspense, useEffect, useState} from "react";
import {getProjects} from "@/app/actions";
import {project} from "@/interfaces";
import {ProjectOverview} from "@/components/projectOverview";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectsPage/>
        </Suspense>
    )
}

function ProjectsPage() {
    const homeProject: project = {
        id: 0,
        name: "",
        description: "",
        budget: 0
    }

    const [selectedProject, setSelectedProject] = useState<project>(homeProject)
    const [projects, setProjects] = useState<project[]>([])


    useEffect(() => {
        async function fetch(): Promise<void> {
            const projects: project[] = await getProjects()
            setProjects(projects)
        }

        fetch().then()
    }, []);

    async function refetchProjects() {
        const projects: project[] = await getProjects()
        setProjects(projects)
    }

    const projectComponentProps: ProjectComponentProps = {
        selectedProject: selectedProject,
        setSelectedProject: setSelectedProject,
        refreshProjects: refetchProjects,
        projects: projects

    }

    return (
        <div className="flex max-w-screen max-h-screen h-screen p-4">
            <ProjectComponent props={projectComponentProps}/>
            <div id={"project_space"} className={"w-full"}>
                {selectedProject.id == 0 ?
                    <ProjectOverview projects={projects}/> :
                    <TransactionComponent project={selectedProject}/>
                }
            </div>
        </div>
    );
}
