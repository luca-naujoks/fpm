package database

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func New() error {
	dsn := "./db/sqlite3.db"

	dir := filepath.Dir(dsn)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return fmt.Errorf("failed to create database directory: %w", err)
	}

	absPath, err := filepath.Abs(dsn)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %w", err)
	}

	database, err := sql.Open("sqlite", absPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	err = database.Ping()
	if err != nil {
		defer func(database *sql.DB) {
			err := database.Close()
			if err != nil {
				log.Printf("failed to close database: %v", err)
			}
		}(database)
		return fmt.Errorf("failed to ping database: %w", err)
	}

	db = database

	err = InitDatabaseTables()
	if err != nil {
		fmt.Println(err)
		panic(err)
	}

	return nil
}

func Close() {
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			fmt.Println("error Closing DB")
			return
		}
	}(db)

	return
}

func InitDatabaseTables() error {
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
