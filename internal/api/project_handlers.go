package api

import (
	"encoding/json"
	"errors"
	"financial-planner/internal/database"
	"financial-planner/internal/models"
	"fmt"
	"net/http"
	"strconv"
)

func GetProject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	projectId, err := strconv.Atoi(id)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	project, err := database.GetProject(projectId)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	respondJSON(w, http.StatusOK, project)
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
