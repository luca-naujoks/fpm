package models

import "time"

type Project struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Budget      int    `json:"budget"`
}

type Transaction struct {
	Id          int       `json:"id"`
	ProjectId   int       `json:"project_id"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Date        time.Time `json:"date"`
}
