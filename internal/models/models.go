package models

import "time"

type Project struct {
	Id          int    `json:"id"`
	Name        string `json:"title"`
	Description string `json:"description"`
	Budget      int    `json:"budget"`
	Pinned      bool   `json:"pinned"`
}

type ProjectPreview struct {
	Id              int         `json:"id"`
	Name            string      `json:"title"`
	Description     string      `json:"description"`
	Budget          int         `json:"budget"`
	Pinned          bool        `json:"pinned"`
	AvailableBudget float64     `json:"available_budget"`
	LastTransaction Transaction `json:"last_transaction"`
}

type Transaction struct {
	Id          int       `json:"id"`
	ProjectId   int       `json:"project_id"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Date        time.Time `json:"date"`
}

type ImportBody struct {
	ProjectId    int           `json:"project_id"`
	Transactions []Transaction `json:"transactions"`
}
