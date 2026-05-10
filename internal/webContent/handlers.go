package webContent

import (
	"financial-planner/internal/database"
	"financial-planner/internal/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetProjectBudget(c *gin.Context) {
	projectId, err := strconv.Atoi(c.Query("projectId"))
	if err != nil {
		errorMessage := fmt.Sprintf("couldn't parse projectId: %s", err)
		c.JSON(400, gin.H{"error": errorMessage})
		return
	}

	budget, err := database.GetBudgetFromProject(projectId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, budget)
	return
}
func GetProjectSpend(c *gin.Context) {
	budget, err := database.GetTotalSpend()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, budget)
	return
}
func GetProjects(c *gin.Context) {
	projects, err := database.GetProjects()
	if err != nil {
		c.JSON(400, gin.H{"error 2": err.Error()})
		return
	}
	c.JSON(200, projects)
	return
}
func CreateProject(c *gin.Context) {
	var project models.Project
	err := c.BindJSON(&project)
	if project.Name == "" {
		c.JSON(400, gin.H{"error": "Project Name cant be empty"})
		return
	}

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	projectId, err := database.CreateProject(project)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"projectId": projectId})
	return
}
func EditProject(c *gin.Context) {
	var project models.Project
	err := c.BindJSON(&project)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	projectId, err := database.UpdateProject(project)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, fmt.Sprintf("Success: Project with id: %v got Updated", projectId))
	return
}
func DeleteProject(c *gin.Context) {
	projectId, err := strconv.Atoi(c.Query("projectId"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	deletedTransactions, err := database.DeleteProject(projectId)
	c.JSON(200, gin.H{"deletedTransactions": deletedTransactions})
	return
}

func GetTransactions(c *gin.Context) {
	projectId, err := strconv.Atoi(c.Query("projectId"))
	if err != nil {
		errorMessage := fmt.Sprintf("couldn't parse projectId: %s", err)
		c.JSON(400, gin.H{"error": errorMessage})
		return
	}

	transactions, err := database.GetProjectTransactions(projectId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, transactions)
	return
}
func CreateTransactions(c *gin.Context) {
	var transaction models.Transaction
	err := c.BindJSON(&transaction)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	projectId, err := database.CreateTransactions(transaction)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"projectId": projectId})
	return
}
func EditTransactions(c *gin.Context) {
	var transaction models.Transaction
	err := c.BindJSON(&transaction)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	projectId, err := database.UpdateTransactions(transaction)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"transactionId": projectId})
	return
}
func DeleteTransactions(c *gin.Context) {
	projectId, err := strconv.Atoi(c.Query("transactionId"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	deletedTransactions, err := database.DeleteTransactions(projectId)
	c.JSON(200, gin.H{"deletedTransactions": deletedTransactions})
	return
}

func ImportTransactions(c *gin.Context) {
	type ImportBody struct {
		ProjectId    int                  `json:"project_id"`
		Transactions []models.Transaction `json:"transactions"`
	}

	var importBody ImportBody
	err := c.BindJSON(&importBody)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to parse JSON to Transaction Data Type"})
		return
	}
	for _, transaction := range importBody.Transactions {
		transaction.ProjectId = importBody.ProjectId
		_, err := database.CreateTransactions(transaction)
		if err != nil {
			c.JSON(500, err.Error())
			return
		}
	}
}

func ExportTransactions(c *gin.Context) {
	projectId, err := strconv.Atoi(c.Query("project_id"))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	transactions, err := database.GetProjectTransactions(projectId)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Set headers for file download
	c.Header("Content-Disposition", "attachment; filename=transactions.json")
	c.Header("Content-Type", "application/json")

	// Send transactions as JSON
	c.JSON(http.StatusOK, transactions)
}
