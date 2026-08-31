package sqlite

import "financial-planner/internal/models"

func combineTransactions(transactions []models.Transaction) float64 {
	total := 0.0
	for _, transaction := range transactions {
		total = total + transaction.Amount
	}

	return total
}
