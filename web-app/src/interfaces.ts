export interface IProject {
    id: number
    name: string
    description: string
    budget: number
}

export interface ITransaction {
    id: number;
    project_id: number;
    description: string;
    amount: number;
    date: Date;
}