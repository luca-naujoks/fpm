package sqlite

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/ncruces/go-sqlite3/driver"
)

type SqliteDB struct {
	*sql.DB
}

func NewSqliteDatabase(dsn string) (*SqliteDB, error) {
	// First check if dsn is a memory database
	// the memory database is only used for clean testing
	if dsn == ":memory:" {
		db, err := sql.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, err
		}

		err = InitTables(db)
		if err != nil {
			return nil, err
		}

		err = MigrationCheck(db)
		if err != nil {
			return nil, err
		}

		return &SqliteDB{db}, nil
	}

	if dsn == "" {
		dsn = "./db/sqlite3.db"
	}

	dir := filepath.Dir(dsn)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	absPath, err := filepath.Abs(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path: %w", err)
	}

	database, err := sql.Open("sqlite3", absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	err = PingTestDatabase(database)
	if err != nil {
		return nil, err
	}

	err = InitTables(database)
	if err != nil {
		return nil, err
	}

	err = MigrationCheck(database)
	if err != nil {
		return nil, err
	}

	return &SqliteDB{database}, nil
}

func PingTestDatabase(db *sql.DB) error {
	err := db.Ping()

	return err
}

func InitTables(db *sql.DB) error {
	if db == nil {
		fmt.Println("Database not jet Initialized")
		return errors.New("database not jet Initialized")
	}

	sqlStatements :=
		[]string{
			`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT NOT NULL,
        description TEXT,
    	budget INTEGER
    );`,
			`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER,
        description TEXT,
    	amount REAL default 0,
    	date DateTime
    );`,
		}

	for _, statement := range sqlStatements {
		_, err := db.Exec(statement)
		if err != nil {
			return err
		}
	}

	return nil
}
