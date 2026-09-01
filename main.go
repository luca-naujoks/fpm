package main

import (
	"embed"
	"financial-planner/internal/api"
	"financial-planner/internal/database"
	"financial-planner/internal/jobs"
	"fmt"
	"io/fs"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/luca-naujoks/webserve"
)

//go:embed solid-web/dist/client
var embeddedContent embed.FS

func main() {
	db, err := database.NewDatabase("./db/sqlite3.db", "sqlite3")
	if err != nil {
		panic(err.Error())
	}

	handlers, err := api.NewAPI(db)
	if err != nil {
		panic(err.Error())
	}

	go jobs.NewScheduler(db)

	go runWebAPI(handlers)

	waitForShutdown(db)
}

func runWebAPI(handlers *api.WebHandlers) {
	webFS, err := fs.Sub(embeddedContent, "solid-web/dist/client")
	if err != nil {
		panic(err.Error())
	}

	r := webserve.New(80, webFS)

	r.Get("/api/projects", handlers.GetProjects)
	r.Get("/api/projects/spend", handlers.GetProjectSpend)
	r.Get("/api/projects/pinned", handlers.GetPinnedProjects)

	r.Post("/api/project", handlers.CreateProject)

	r.Get("/api/project/{id}", handlers.GetProject)
	r.Put("/api/project/{id}/pin", handlers.TogglePinnedProject)
	r.Put("/api/project/{id}", handlers.EditProject)
	r.Delete("/api/project/{id}", handlers.DeleteProject)

	r.Get("/api/project/{id}/transactions", handlers.GetTransactions)
	r.Post("/api/project/{id}/transaction", handlers.CreateTransaction)
	r.Put("/api/project/{id}/transaction", handlers.EditTransaction)
	r.Delete("/api/project/{id}/transaction", handlers.DeleteTransaction)

	r.Get("/api/transaction/export", handlers.ExportTransactions)
	r.Put("/api/transaction/import", handlers.ImportTransactions)

	err = r.Run()
	if err != nil {
		fmt.Printf("Server Exited with error: %s", err.Error())
		return
	}
}

func waitForShutdown(db database.Database) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	//TODO: Shutdown Web API (first needs work at the webserve package)

	//TODO: unregister all jobs from the Scheduler

	err := db.Close()
	if err != nil {
		fmt.Printf("error Closing database: %s", err.Error())
		fmt.Printf("Aborting Shutdown")
		return
	}

	log.Println("[INFO] Shutting down...")
}
