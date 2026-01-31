export interface project {
    id: number
    name: string
    description: string | null
    budget: number
}

export interface transaction {
    id: number;
    projectId: number;
    transactionDescription: string;
    transactionType: string;
    transactionAmount: number;
    transactionDate: Date;
    monthly: boolean;
    deleted: boolean;
}