package database

import (
	"financial-planner/internal/database/sqlite"
	"financial-planner/internal/models"
	"fmt"

	_ "github.com/ncruces/go-sqlite3/driver"
)

type Database interface {
	ProjectSpace
	TransactionSpace

	Close() error
}

type ProjectSpace interface {
	GetProjects() ([]models.ProjectPreview, error)
	GetProject(id int) (models.ProjectPreview, error)
	CreateProject(project models.Project) (int64, error)
	UpdateProject(project models.Project) (int, error)
	DeleteProject(projectId int) error

	GetPinnedProjects() ([]models.Project, error)
	TogglePinnedProject(id int) error
}

type TransactionSpace interface {
	GetTotalSpend() (float64, error)

	GetProjectTransactions(projectId int) ([]models.Transaction, error)
	GetLastTransaction(projectId int) (models.Transaction, error)
	CreateTransactions(transaction models.Transaction) (int64, error)
	UpdateTransactions(transaction models.Transaction) (int64, error)
	DeleteTransactions(transactionId int) (removedTransactions int64, err error)
}

func NewDatabase(dsn string, dbType string) (Database, error) {
	switch dbType {
	case "sqlite3":
		return sqlite.NewSqliteDatabase(dsn)
	default:
		return nil, fmt.Errorf("unknown database type")
	}
}
