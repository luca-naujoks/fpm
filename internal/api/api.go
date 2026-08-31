package api

import (
	"errors"
	"financial-planner/internal/database"
)

type WebHandlers struct {
	db database.Database
}

func NewAPI(db database.Database) (*WebHandlers, error) {
	if db == nil {
		errorMessage := errors.New("database pointer is nil")
		return nil, errorMessage
	}

	return &WebHandlers{db}, nil
}
