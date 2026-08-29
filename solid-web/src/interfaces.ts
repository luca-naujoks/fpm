export interface IProject {
    id: number
    title: string
    description: string
    budget: number
    pinned: boolean
    available_budget: number
    last_transaction: ITransaction
}

export interface IProjectSettings {
    id: number
    title: string
    description: string
    budget: number
    pinned: boolean
}

export interface ITransaction {
    id: number;
    project_id: number;
    description: string;
    amount: number;
    date: Date;
}