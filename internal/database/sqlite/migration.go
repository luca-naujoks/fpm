package sqlite

import (
	"database/sql"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"strings"
	"time"

	dbMigrations "financial-planner/db/migrations"
)

type MigrationEntry struct {
	Id         int       `json:"id"`
	Name       string    `json:"name"`
	ExecutedAt time.Time `json:"executed_at"`
}

func MigrationCheck(db *sql.DB) error {
	var openMigrations []os.DirEntry

	fmt.Println("Running Migration Check")

	_, err := db.Exec("CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL ,executed_at DateTime)")
	if err != nil {
		return err
	}

	migrations, err := fs.ReadDir(dbMigrations.FS, ".")
	if err != nil {
		return err
	}

	for _, migration := range migrations {
		if migration.IsDir() {
			continue
		}

		if !strings.HasSuffix(migration.Name(), ".sql") {
			continue
		}

		status, err := isMigrationNeeded(db, strings.ReplaceAll(migration.Name(), ".sql", ""))
		if err != nil {
			return err
		}

		// Skip the current Migration if it is not needed
		if !status {
			continue
		}

		openMigrations = append(openMigrations, migration)
	}

	fmt.Printf("Found %v open Migrations to apply\n", len(openMigrations))

	for _, entry := range openMigrations {
		name := strings.ReplaceAll(entry.Name(), ".sql", "")

		err = executeMigration(db, name, entry.Name())
		if err != nil {
			return err
		}
	}

	return nil
}

func isMigrationNeeded(db *sql.DB, migrationName string) (bool, error) {
	var migrationEntry MigrationEntry

	sqlQuery := "SELECT id, name, executed_at FROM schema_migrations WHERE name = ?"

	row := db.QueryRow(sqlQuery, migrationName)
	err := row.Scan(&migrationEntry.Id, &migrationEntry.Name, &migrationEntry.ExecutedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return true, nil
	}

	if err != nil {
		return false, err
	}

	return false, nil
}

func executeMigration(db *sql.DB, migrationName string, migrationPath string) error {
	fmt.Printf("Executing Migration: %s\n", migrationName)

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	migration, ok := dataMigrations[migrationName]

	if ok {
		err = migration(tx)
		if err != nil {
			return err
		}
	} else {
		content, err := fs.ReadFile(dbMigrations.FS, migrationPath)
		if err != nil {
			return err
		}

		sqlStatement := string(content)

		_, err = tx.Exec(sqlStatement)
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(
		"INSERT INTO schema_migrations (name, executed_at) VALUES (?, ?)",
		migrationName,
		time.Now().UTC().Format(time.RFC3339),
	)

	if err != nil {
		return err
	}

	return tx.Commit()
}
