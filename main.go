package main

import (
	"embed"
	"financial-planner/internal/database"
	"financial-planner/internal/jobs"
	"financial-planner/internal/server"
	"fmt"
)

//go:embed web-app/dist
var embededContent embed.FS

func main() {
	err := database.New()
	if err != nil {
		fmt.Println(err)
		return
	}

	go jobs.NewScheduler()

	r := server.New(":80", embededContent)

	r.GET("/api/projects", server.GetProjects)
	r.POST("/api/project", server.CreateProject)
	r.PUT("/api/project", server.EditProject)
	r.DELETE("/api/project", server.DeleteProject)

	r.GET("/api/project/budget", server.GetProjectBudget)
	r.GET("/api/spend", server.GetProjectSpend)

	r.GET("/api/transactions", server.GetTransactions)
	r.POST("/api/transaction", server.CreateTransactions)
	r.PUT("/api/transaction", server.EditTransactions)
	r.DELETE("/api/transaction", server.DeleteTransactions)
	r.PUT("/api/transaction/import", server.ImportTransactions)
	r.GET("/api/transaction/export", server.ExportTransactions)

	err = r.Run()
	if err != nil {
		fmt.Printf("Server Exited with error: %s", err.Error())
		return
	}
}
