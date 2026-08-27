package database

import (
	"financial-planner/internal/models"
	"testing"
	"time"
)

func TestCombineTransactions(t *testing.T) {
	transactions := []models.Transaction{
		{
			Id:          0,
			ProjectId:   0,
			Description: "",
			Amount:      50.50,
			Date:        time.Time{},
		},
		{
			Id:          0,
			ProjectId:   0,
			Description: "",
			Amount:      49.50,
			Date:        time.Time{},
		},
		{
			Id:          0,
			ProjectId:   0,
			Description: "",
			Amount:      12.12,
			Date:        time.Time{},
		},
	}

	total := combineTransactions(transactions)

	if total != 112.12 {
		t.Errorf("Expected: 112.112 Retrieved: %v", total)
	}
}
