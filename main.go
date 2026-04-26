package main

import (
	"financial-planner/internal/database"
	"financial-planner/internal/jobs"
	"financial-planner/internal/webContent"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	err := database.New()
	if err != nil {
		fmt.Println(err)
		return
	}

	go jobs.NewScheduler()

	router := gin.Default()

	// create api group to serve backend functionalities
	api := router.Group("/api")
	{
		api.GET("/projects", func(c *gin.Context) {
			webContent.GetProjects(c)
		})
		api.POST("/project", func(c *gin.Context) {
			webContent.CreateProject(c)
		})
		api.PUT("/project", func(c *gin.Context) {
			webContent.EditProject(c)
		})
		api.DELETE("/project", func(c *gin.Context) {
			webContent.DeleteProject(c)
		})

		api.GET("/project/budget", func(c *gin.Context) {
			webContent.GetProjectBudget(c)
		})
		api.GET("/spend", func(c *gin.Context) {
			webContent.GetProjectSpend(c)
		})

		api.GET("/transactions", func(c *gin.Context) {
			webContent.GetTransactions(c)
		})
		api.POST("/transaction", func(c *gin.Context) {
			webContent.CreateTransactions(c)
		})
		api.PUT("/transaction", func(c *gin.Context) {
			webContent.EditTransactions(c)
		})
		api.DELETE("/transaction", func(c *gin.Context) {
			webContent.DeleteTransactions(c)
		})
		api.PUT("/transaction/import", func(c *gin.Context) {
			webContent.ImportTransactions(c)
		})
		api.GET("/transaction/export", func(c *gin.Context) {
			webContent.ExportTransactions(c)
		})

	}

	// Serve frontend files
	_, err = os.Stat("web-app/dist")
	if err == nil {
		fmt.Println("Serving frontend files from local source")
		router.Static("/assets", "web-app/dist/assets")
		router.GET("/", func(c *gin.Context) {
			c.File("web-app/dist/index.html")
		})
		router.GET("/favicon.ico", func(c *gin.Context) {
			c.File("web-app/dist/favicon.ico")
		})
	} else {
		fmt.Println("Serving frontend files from embedded source")
		router.GET("/favicon.ico", func(c *gin.Context) {
			ServeEmbeddedFile(c, "", "favicon.ico")
		})
		router.GET("/assets/*filepath", func(c *gin.Context) {
			assetPath := c.Param("filepath")
			fmt.Printf("Serving asset: %s\n", assetPath)
			ServeEmbeddedFile(c, "assets", assetPath)
		})
		router.GET("/", func(c *gin.Context) {
			ServeEmbeddedFile(c, "", "index.html")
		})
	}

	fmt.Println("Server started on Interface :6060")
	err = router.Run(":6060")
	if err != nil {
		errMessage := fmt.Errorf("failed to run server: %v", err)
		fmt.Println(errMessage)
	}
}
