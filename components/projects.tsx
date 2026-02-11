"use client"

import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {createProject, deleteProject, editProject} from "@/app/actions"; // Assuming editProject exists
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
import {project} from "@/interfaces";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";

export interface ProjectComponentProps {
    selectedProject: project,
    setSelectedProject: React.Dispatch<React.SetStateAction<project>>
    projects: project[]
    refreshProjects: () => void
}

export function ProjectComponent({props}: { props: ProjectComponentProps }) {
    const [editingProject, setEditingProject] = useState<project | null>(null);

    function handleProjectSwitch(project: project) {
        props.setSelectedProject(project)
    }

    return (
        <Card className="w-64 mr-8 text-muted-foreground">
            <CardHeader className={"flex justify-between w-full"}>
                <h2 className={"text-start"}>Projects</h2>
                <AddProjectButton refresh={() => props.refreshProjects()}/>
            </CardHeader>
            <CardContent className={"flex flex-col gap-2"}>
                <Button variant={"secondary"} className={"w-full text-muted-foreground"}
                        onClick={() => handleProjectSwitch({id: 0} as project)}
                        disabled={props.selectedProject.id == 0}>Home</Button>

                {props.projects.map((p) => (
                    <ContextMenu key={p.id}>
                        <ContextMenuTrigger>
                            <Button variant={"secondary"} className={"w-full text-muted-foreground"}
                                    onClick={() => handleProjectSwitch(p)}
                                    disabled={props.selectedProject.id == p.id}>{p.name}
                            </Button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onSelect={() => setEditingProject(p)}>
                                Edit
                            </ContextMenuItem>
                            <ContextMenuItem variant={"destructive"} onClick={() => {
                                deleteProject(p.id).then(() => props.refreshProjects());
                            }}>Delete</ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                ))}
            </CardContent>
            {editingProject && (
                <EditProject
                    project={editingProject}
                    open={!!editingProject}
                    onOpenChange={(open) => !open && setEditingProject(null)}
                    refresh={() => props.refreshProjects()}
                />
            )}
        </Card>
    )
}


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
    const [budgetEnabled, setBudgetEnabled] = useState(true);

    async function handleAction(formData: FormData) {
        if (!budgetEnabled) {
            formData.set("budget", "0");
        }
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
                        <div className={"flex gap-4 items-center"}>
                            <Checkbox
                                checked={budgetEnabled}
                                onCheckedChange={(checked) => setBudgetEnabled(checked as boolean)}
                            />
                            <Label>Enable Monthly budget addition</Label>
                        </div>
                        {budgetEnabled && (
                            <div className={"grid gap-3 "}>
                                <Label htmlFor="budget">Monthly Income/Budget</Label>
                                <Input id="budget" name="budget" type="number" defaultValue={100}/>
                            </div>
                        )}
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