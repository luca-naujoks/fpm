package api

import (
	"encoding/json"
	"errors"
	"financial-planner/internal/models"
	"fmt"
	"net/http"
	"strconv"
)

func (api *WebHandlers) GetProject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	projectId, err := strconv.Atoi(id)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	project, err := api.db.GetProject(projectId)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	respondJSON(w, http.StatusOK, project)
}
func (api *WebHandlers) GetProjectSpend(w http.ResponseWriter, r *http.Request) {
	budget, err := api.db.GetTotalSpend()
	if err != nil {
		http.Error(w, fmt.Sprintf("error: %s", err.Error()), http.StatusBadRequest)
		return
	}

	response := map[string]float64{
		"value": budget,
	}

	respondJSON(w, http.StatusOK, response)
}
func (api *WebHandlers) GetProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := api.db.GetProjects()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, projects)
}

func (api *WebHandlers) CreateProject(w http.ResponseWriter, r *http.Request) {
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

	projectID, err := api.db.CreateProject(project)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]int64{
		"projectID": projectID,
	}
	respondJSON(w, http.StatusCreated, response)
}
func (api *WebHandlers) EditProject(w http.ResponseWriter, r *http.Request) {
	var project models.Project
	err := json.NewDecoder(r.Body).Decode(&project)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}
	projectID, err := api.db.UpdateProject(project)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	response := map[string]string{
		"success": fmt.Sprintf("Project with id: %v got Updated", projectID),
	}
	respondJSON(w, http.StatusOK, response)
}
func (api *WebHandlers) DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	projectId, err := strconv.Atoi(id)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	err = api.db.DeleteProject(projectId)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (api *WebHandlers) GetPinnedProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := api.db.GetPinnedProjects()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	respondJSON(w, http.StatusOK, projects)
}

func (api *WebHandlers) TogglePinnedProject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	projectId, err := strconv.Atoi(id)
	if err != nil {
		respondError(w, http.StatusBadRequest, err)
		return
	}

	err = api.db.TogglePinnedProject(projectId)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
