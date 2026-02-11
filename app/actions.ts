"use server";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {project, transaction} from "@/interfaces";

export async function createProject(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const budgetRaw = formData.get("budget");
    const budget = budgetRaw ? parseFloat(budgetRaw.toString()) : 50;

    if (!name) return {error: "Name is required"};

    try {
        await db.projects.create({
            data: {
                name: name,
                description: description,
                budget: budget
            },
        });

        revalidatePath("/");
        return {success: true};
    } catch (e) {
        return {error: e};
    }
}

export async function getProject(projectId: number): Promise<project> {
    const project = await db.projects.findFirst({where: {id: projectId}});
    return project ? project : {id: 0, name: "", description: null, budget: 0};

}

export async function getProjects(): Promise<project[]> {
    return db.projects.findMany();
}

export async function editProject(formData: FormData) {
    if (formData.get("id") == null) {
        return {success: false, message: "id null"}
    }
    if (formData.get("name") == null) {
        return {success: false, message: "name null"}
    }
    if (formData.get("budget") == null) {
        return {success: false, message: "budget null"}
    }
    if (formData.get("description") == null) {
        return {success: false, message: "description null"}
    }

    const id: string = formData.get("id") as string
    const budget: string = formData.get("budget") as string

    const name: string = formData.get("name") as string
    const description: string = formData.get("description") as string

    try {
        await db.projects.update({
            where: {id: parseFloat(id)}, data: {
                name: name,
                description: description,
                budget: parseFloat(budget)
            }
        })
        return {success: true}
    } catch (e) {
        return {success: false, message: e}
    }

}

export async function deleteProject(projectId: number) {
    try {
        await db.projects.delete({where: {id: projectId}})
        return {success: true}
    } catch (e) {
        return {error: e};
    }
}

// Transaction related actions

export async function createTransaction(formData: FormData) {
    const projectIdRaw = formData.get("projectId");
    const projectId = projectIdRaw ? parseFloat(projectIdRaw.toString()) : 0;

    const description = formData.get("description") as string;
    const transactionType = formData.get("transactionType") as string;

    const transactionAmountRaw = formData.get("transactionAmount");
    const transactionAmount = transactionAmountRaw ? parseFloat(transactionAmountRaw.toString()) : 50;

    const transactionDateRaw = formData.get("transactionDate");
    const transactionDate = transactionDateRaw ? new Date(transactionDateRaw.toString()) : undefined;

    if (projectId == 0) return {error: "ProjectId is required"};
    if (transactionDate == undefined) return {error: "Transaction Date is required"};

    try {
        await db.transactions.create({
            data: {
                projectId: projectId,
                transactionDescription: description,
                transactionType: transactionType,
                transactionAmount: transactionAmount,
                transactionDate: transactionDate
            },
        });

        revalidatePath("/");
        return {success: true};
    } catch (e) {
        return {error: e};
    }
}

export async function getTransactions(projectId: number): Promise<transaction[]> {
    const automaticTransactions: transaction[] = await db.transactions.findMany({
        where: {
            projectId: projectId,
            monthly: true
        }
    })
    const project: project | null = await db.projects.findFirst({where: {id: projectId}})

    if (!project) {
        return []
    }

    const currentMonth: number = new Date().getMonth()
    const currentYear: number = new Date().getFullYear()

    let alreadyPayedThisMonth: boolean = false

    // checks all records if the budget already got added for this month. when not alreadyPayedThisMonth is false
    for (const i of automaticTransactions) {
        if (alreadyPayedThisMonth) {
            break
        }
        if (new Date(i.transactionDate).getMonth() == currentMonth && new Date(i.transactionDate).getFullYear() == currentYear) {
            alreadyPayedThisMonth = true
            break
        }
    }

    if (!alreadyPayedThisMonth) {
        await db.transactions.create({
            data: {
                projectId: project.id,
                transactionDescription: "Monthly",
                transactionType: "income",
                transactionAmount: project.budget,
                transactionDate: new Date(Date.UTC(currentYear, currentMonth, 1)),
                monthly: true
            },
        })
    }

    return db.transactions.findMany({
        where: {projectId: projectId, deleted: false},
        orderBy: {transactionDate: "desc"}
    });

}

export async function editTransaction(formData: FormData) {
    if (formData.get("id") == null) {
        return {success: false, message: "id null"}
    }
    if (formData.get("amount") == null) {
        return {success: false, message: "amount null"}
    }
    if (formData.get("description") == null) {
        return {success: false, message: "description null"}
    }

    const id: string = formData.get("id") as string
    const amount: string = formData.get("amount") as string
    const description: string = formData.get("description") as string
    const transactionDateRaw = formData.get("transactionDate");
    const transactionDate = transactionDateRaw ? new Date(transactionDateRaw.toString()) : undefined;

    try {
        await db.transactions.update({
            where: {id: parseFloat(id)}, data: {
                transactionAmount: parseFloat(amount),
                transactionDescription: description,
                ...(transactionDate !== undefined ? {transactionDate} : {})
            }
        })
        return {success: true}
    } catch (e) {
        return {success: false, message: e}
    }
}

export async function deleteTransaction(transactionId: number) {
    const transaction: transaction | null = await db.transactions.findFirst({where: {id: transactionId}})

    if (!transaction) {
        return {error: "transaction not found in db"};
    }

    try {
        if (transaction.monthly) {
            await db.transactions.update({where: {id: transaction.id}, data: {deleted: true}})
        } else {
            await db.transactions.delete({where: {id: transaction.id}})
        }
        return {success: true}
    } catch (e) {
        return {error: e};
    }
}

export async function getAllIncomes(): Promise<transaction[]> {
    return db.transactions.findMany({where: {transactionType: "income", deleted: false}});
}

export async function getAllExpenses(): Promise<transaction[]> {
    return db.transactions.findMany({where: {transactionType: "expense", deleted: false}});
}