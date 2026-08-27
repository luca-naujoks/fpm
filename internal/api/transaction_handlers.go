package api

import (
	"encoding/json"
	"financial-planner/internal/database"
	"financial-planner/internal/models"
	"net/http"
	"strconv"
)

func GetTransactions(w http.ResponseWriter, r *http.Request) {
	id := ParsePathParam(r, "id")
	projectId, err := strconv.Atoi(id)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	transactions, err := database.GetProjectTransactions(projectId)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, transactions)
}

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
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

func EditTransaction(w http.ResponseWriter, r *http.Request) {
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

func DeleteTransaction(w http.ResponseWriter, r *http.Request) {
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

	w.WriteHeader(http.StatusNoContent)
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
