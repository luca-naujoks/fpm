package migrations

import (
	"database/sql"
	"errors"
	"financial-planner/internal/database/sqlite"
	"fmt"
	"os"
	"path"
	"strings"
	"time"
)

var migrationsPath = "./db/migrations"

type MigrationRunner struct {
	db *sql.DB
}

type MigrationEntry struct {
	Id         int       `json:"id"`
	Name       string    `json:"name"`
	ExecutedAt time.Time `json:"executed_at"`
}

func MigrationCheck(dsn string) error {
	var openMigrations []os.DirEntry

	fmt.Println("Running Migration Check")

	migrations, err := os.ReadDir(migrationsPath)
	if err != nil {
		return err
	}

	migrationRunner, err := setupMigrationHelper(dsn)
	if err != nil {
		return err
	}
	defer migrationRunner.db.Close()

	for _, migration := range migrations {
		if migration.IsDir() {
			continue
		}

		if !strings.HasSuffix(migration.Name(), ".sql") {
			continue
		}

		status, err := migrationRunner.isMigrationNeeded(strings.ReplaceAll(migration.Name(), ".sql", ""))
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

		fmt.Printf("Executing Migration: %s\n", name)

		migrationPath := path.Join(migrationsPath, entry.Name())
		err = migrationRunner.executeMigration(name, migrationPath)
		if err != nil {
			return err
		}
	}

	return nil
}

func setupMigrationHelper(dsn string) (*MigrationRunner, error) {
	db, err := sqlite.NewSqliteDatabase(dsn)
	if err != nil {
		return nil, err
	}

	sqlStatement := "CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL ,executed_at DateTime)"

	_, err = db.Exec(sqlStatement)

	return &MigrationRunner{db: db.DB}, err
}

func (r MigrationRunner) isMigrationNeeded(migrationName string) (bool, error) {
	var migrationEntry MigrationEntry

	sqlQuery := "SELECT id, name, executed_at FROM schema_migrations WHERE name = ?"

	row := r.db.QueryRow(sqlQuery, migrationName)
	err := row.Scan(&migrationEntry.Id, &migrationEntry.Name, &migrationEntry.ExecutedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return true, nil
	}

	if err != nil {
		return false, err
	}

	return false, nil
}

func (r MigrationRunner) executeMigration(migrationName string, migrationPath string) error {
	tx, err := r.db.Begin()
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
		content, err := os.ReadFile(migrationPath)
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
