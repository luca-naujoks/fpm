"use client"

import {Button} from "@/components/ui/button";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {createProject, deleteProject, editProject, getProjects} from "@/app/actions"; // Assuming editProject exists
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/dist/client/components/navigation";
import {project} from "@/interfaces";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";

export function ProjectComponent({selectedProject, setSelectedProject}: {
    selectedProject: project,
    setSelectedProject: Dispatch<SetStateAction<project>>
}) {
    const router = useRouter()
    const [projects, setProjects] = useState<project[]>([])

    // 1. Lifted state for the project currently being edited
    const [editingProject, setEditingProject] = useState<project | null>(null);

    useEffect(() => {
        async function fetch(): Promise<void> {
            const projects = await getProjects()
            setProjects(projects)
        }

        fetch()
    }, []);

    function handleProjectSwitch(project: project) {
        setSelectedProject(project)
        router.push("?project=" + project.id)
    }

    async function refetchProjects() {
        const projects: project[] = await getProjects()
        setProjects(projects)
    }

    return (
        <div className="w-64 min-h-1/2 bg-card border-sidebar-border border rounded-lg shadow p-4 mr-8">
            <span className={"flex gap-2 justify-between items-center mb-2"}>
                <h2>Projects</h2>
                <AddProjectButton refresh={refetchProjects}/>
            </span>
            <div className={"flex flex-col gap-2"}>
                <Button variant={"secondary"} className={"w-full "}
                        onClick={() => handleProjectSwitch({id: 0} as project)}
                        disabled={selectedProject.id == 0}>Home</Button>

                {projects.map((p) => (
                    <ContextMenu key={p.id}>
                        <ContextMenuTrigger>
                            <Button variant={"secondary"} className={"w-full "}
                                    onClick={() => handleProjectSwitch(p)}
                                    disabled={selectedProject.id == p.id}>{p.name}
                            </Button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onSelect={() => setEditingProject(p)}>
                                Edit
                            </ContextMenuItem>
                            <ContextMenuItem variant={"destructive"} onClick={() => {
                                deleteProject(p.id);
                                setProjects((prev) => prev.filter((proj) => proj.id !== p.id))
                            }}>Delete</ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                ))}
            </div>

            {/* 2. Single Edit Dialog Instance */}
            {editingProject && (
                <EditProject
                    project={editingProject}
                    open={!!editingProject}
                    onOpenChange={(open) => !open && setEditingProject(null)}
                    refresh={refetchProjects}
                />
            )}
        </div>
    )
}

// 3. Move outside to prevent focus loss/re-mounting
function EditProject({project, open, onOpenChange, refresh}: {
    project: project,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    refresh: () => void
}) {
    async function handleAction(formData: FormData) {
        // Ensure the ID is passed for the update action
        formData.append("id", project.id.toString());

        // Use editProject action instead of createProject
        const result = await editProject(formData);

        if (result?.success) {
            onOpenChange(false);
            refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-1/4">
                <form action={handleAction}>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update your project details below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="edit-name">Project Name</Label>
                            <Input id="edit-name" name="name" defaultValue={project.name} required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input id="edit-description" name="description" defaultValue={project.description || ""}/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-budget">Monthly Income/Budget</Label>
                            <Input id="edit-budget" name="budget" type="number" defaultValue={project.budget}/>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddProjectButton({refresh}: { refresh: () => void }) {
    const [open, setOpen] = useState(false);

    async function handleAction(formData: FormData) {
        const result = await createProject(formData);
        if (result?.success) {
            setOpen(false);
            refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">+ Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-1/4">
                <form action={handleAction}>
                    <DialogHeader>
                        <DialogTitle>Add Project</DialogTitle>
                        <DialogDescription>
                            Create your Side Project. Click Save to create it.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" name="name" placeholder="Home Lab" required/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="All expenses..."/>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Monthly Income/Budget</Label>
                            <Input id="budget" name="budget" type="number" defaultValue={100}/>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}