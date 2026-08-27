package main

import (
	"embed"
	"financial-planner/internal/api"
	"financial-planner/internal/database"
	"financial-planner/internal/jobs"
	"fmt"
	"io/fs"

	"github.com/luca-naujoks/webserve"
)

//go:embed solid-web/dist/client
var embeddedContent embed.FS

func main() {
	webFS, err := fs.Sub(embeddedContent, "solid-web/dist/client")
	if err != nil {
		panic(err.Error())
	}

	err = database.New()
	if err != nil {
		panic(err.Error())
	}

	go jobs.NewScheduler()

	r := webserve.New(80, webFS)

	r.Get("/api/projects", api.GetProjects)
	r.Get("/api/projects/spend", api.GetProjectSpend)

	r.Get("/api/project/{id}", api.GetProject)
	r.Post("/api/project", api.CreateProject)
	r.Put("/api/project", api.EditProject)
	r.Delete("/api/project", api.DeleteProject)

	r.Get("/api/project/{id}/transactions", api.GetTransactions)
	r.Post("/api/project/{id}/transaction", api.CreateTransaction)
	r.Put("/api/project/{id}/transaction", api.EditTransaction)
	r.Delete("/api/project/{id}/transaction", api.DeleteTransaction)

	r.Get("/api/transaction/export", api.ExportTransactions)
	r.Put("/api/transaction/import", api.ImportTransactions)

	err = r.Run()
	if err != nil {
		fmt.Printf("Server Exited with error: %s", err.Error())
		return
	}
}
