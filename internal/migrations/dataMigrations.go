package migrations

import (
	"database/sql"
	"fmt"
	"time"
)

type DataMigration func(*sql.Tx) error

var dataMigrations = map[string]DataMigration{
	"002_normalize_transaction_Dates": normalizeTransactionDates,
}

// 002_normalize_transaction_Dates
func normalizeTransactionDates(tx *sql.Tx) error {
	type transactionDate struct {
		Id   int    `json:"id"`
		Date string `json:"date"`
	}
	var dates []transactionDate

	sqlQuery := "SELECT id, date FROM main.transactions WHERE date IS NOT NULL"

	rows, err := tx.Query(sqlQuery)
	if err != nil {
		return err
	}

	for rows.Next() {
		var transaction transactionDate

		err = rows.Scan(&transaction.Id, &transaction.Date)
		if err != nil {
			rows.Close()
			return err
		}

		dates = append(dates, transaction)
	}

	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}

	err = rows.Close()
	if err != nil {
		return err
	}

	for _, row := range dates {
		sqlUpdate := "UPDATE transactions SET date = ? WHERE id = ?"

		// 2026-04-01 00:00:00 +0000 UTC
		parsed, err := parseTransactionDate(row.Date)
		if err != nil {
			return err
		}

		normalized := parsed.UTC().Format(time.RFC3339)

		_, err = tx.Exec(sqlUpdate, normalized, row.Id)
		if err != nil {
			return err
		}
	}

	return nil
}

func parseTransactionDate(value string) (time.Time, error) {
	formats := []string{
		time.RFC3339Nano,
		time.RFC3339,
		"2006-01-02 15:04:05.999999999 -0700 MST",
	}

	for _, format := range formats {
		parsed, err := time.Parse(format, value)
		if err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("unsupported transaction date format: %q", value)
}
