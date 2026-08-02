package server

import (
	"encoding/json"
	"errors"
	"financial-planner/internal/database"
	"financial-planner/internal/models"
	"fmt"
	"net/http"
)

func GetProjectBudget(w http.ResponseWriter, r *http.Request) {
	projectID, err := ParseIntQuery(r, "project_id")
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	budget, err := database.GetBudgetFromProject(projectID)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	response := map[string]float64{
		"value": budget,
	}

	respondJSON(w, http.StatusOK, response)
}
func GetProjectSpend(w http.ResponseWriter, r *http.Request) {
	budget, err := database.GetTotalSpend()
	if err != nil {
		http.Error(w, fmt.Sprintf("error: %s", err.Error()), http.StatusBadRequest)
		return
	}

	response := map[string]float64{
		"value": budget,
	}

	respondJSON(w, http.StatusOK, response)
}
func GetProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	projects, err := database.GetProjects()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, projects)
}

func CreateProject(w http.ResponseWriter, r *http.Request) {
	var project models.Project
	err := json.NewDecoder(r.Body).Decode(&project)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, err)
		return
	}

	if project.Name == "" {
		respondError(w, http.StatusBadRequest, errors.New("project Name cant be empty"))
		return
	}

	projectID, err := database.CreateProject(project)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]int64{
		"projectID": projectID,
	}
	respondJSON(w, http.StatusCreated, response)
}
func EditProject(w http.ResponseWriter, r *http.Request) {
	var project models.Project
	err := json.NewDecoder(r.Body).Decode(&project)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	projectID, err := database.UpdateProject(project)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]string{
		"success": fmt.Sprintf("Project with id: %v got Updated", projectID),
	}
	respondJSON(w, http.StatusOK, response)
}
func DeleteProject(w http.ResponseWriter, r *http.Request) {
	projectID, err := ParseIntQuery(r, "project_id")
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	err = database.DeleteProject(projectID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]int{
		"deletedProject": projectID,
	}

	respondJSON(w, http.StatusOK, response)
}

func GetTransactions(w http.ResponseWriter, r *http.Request) {
	projectID, err := ParseIntQuery(r, "project_id")
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	transactions, err := database.GetProjectTransactions(projectID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, transactions)
}
func CreateTransactions(w http.ResponseWriter, r *http.Request) {
	var transaction models.Transaction
	err := json.NewDecoder(r.Body).Decode(&transaction)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	projectID, err := database.CreateTransactions(transaction)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]int64{
		"project_id": projectID,
	}

	respondJSON(w, http.StatusCreated, response)
}
func EditTransactions(w http.ResponseWriter, r *http.Request) {
	var transaction models.Transaction
	err := json.NewDecoder(r.Body).Decode(&transaction)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	transactionId, err := database.UpdateTransactions(transaction)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]int64{
		"transaction_id": transactionId,
	}

	respondJSON(w, http.StatusOK, response)
}
func DeleteTransactions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	projectID, err := ParseIntQuery(r, "transaction_id")
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	deletedTransactions, err := database.DeleteTransactions(projectID)

	response := map[string]int64{
		"deleted_transactions": deletedTransactions,
	}

	respondJSON(w, http.StatusOK, response)
}

func ImportTransactions(w http.ResponseWriter, r *http.Request) {
	var importBody models.ImportBody
	err := json.NewDecoder(r.Body).Decode(&importBody)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	for _, transaction := range importBody.Transactions {
		transaction.ProjectId = importBody.ProjectId
		_, err = database.CreateTransactions(transaction)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err)
			return
		}
	}

	respondJSON(w, http.StatusNoContent, "")
}

func ExportTransactions(w http.ResponseWriter, r *http.Request) {
	projectID, err := ParseIntQuery(r, "project_id")
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	transactions, err := database.GetProjectTransactions(projectID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	// Set headers for file download
	w.Header().Set("Content-Disposition", "attachment; filename=transactions.json")

	respondJSON(w, http.StatusOK, transactions)
}
