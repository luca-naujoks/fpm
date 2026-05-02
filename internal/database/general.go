package database

import (
	"database/sql"
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
