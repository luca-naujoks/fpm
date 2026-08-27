package database

import (
	"database/sql"
	"financial-planner/internal/models"
)

func GetTotalSpend() (float64, error) {
	var sum sql.NullFloat64
	sqlQuery := `SELECT SUM(amount) FROM transactions WHERE amount < 0`

	row := db.QueryRow(sqlQuery)

	err := row.Scan(&sum)
	if err != nil {
		return 0, err
	}

	return sum.Float64, nil
}
func GetProjectTransactions(projectId int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	transactions = []models.Transaction{}
	sqlQuery := `SELECT id, projectId, description, amount, date FROM transactions WHERE projectId = ? ORDER BY date DESC`

	rows, err := db.Query(sqlQuery, projectId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		transaction := &models.Transaction{}
		err := rows.Scan(&transaction.Id, &transaction.ProjectId, &transaction.Description, &transaction.Amount, &transaction.Date)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, *transaction)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}

func GetLastTransaction(projectId int) (models.Transaction, error) {
	var transaction models.Transaction
	sqlQuery := `SELECT id, projectId, description, amount, date FROM transactions WHERE projectId = ? ORDER BY date DESC LIMIT 1`

	row := db.QueryRow(sqlQuery, projectId)
	err := row.Scan(&transaction.Id, &transaction.ProjectId, &transaction.Description, &transaction.Amount, &transaction.Date)
	if err != nil {
		return models.Transaction{}, err
	}

	return transaction, nil
}

func CreateTransactions(transaction models.Transaction) (int64, error) {
	sqlQuery := `INSERT INTO transactions (projectid, description, amount, date) values (?, ?, ?, ?)`
	result, err := db.Exec(sqlQuery, transaction.ProjectId, transaction.Description, transaction.Amount, transaction.Date)
	if err != nil {
		return 0, err
	}

	transactionId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return transactionId, nil
}

func UpdateTransactions(transaction models.Transaction) (int64, error) {
	sqlQuery := `UPDATE transactions SET description = ?, amount = ?, date = ? WHERE id = ?`
	result, err := db.Exec(sqlQuery, transaction.Description, transaction.Amount, transaction.Date, transaction.Id)
	if err != nil {
		return 0, err
	}
	projectId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return projectId, nil
}

func DeleteTransactions(transactionId int) (removedTransactions int64, err error) {
	sqlQueryTransaction := `DELETE FROM transactions WHERE id = ?`

	// First Delete Transactions
	transactionResults, err := db.Exec(sqlQueryTransaction, transactionId)
	if err != nil {
		return 0, err
	}

	affectedTransactions, err := transactionResults.RowsAffected()
	if err != nil {
		return 0, err
	}

	return affectedTransactions, nil
}
