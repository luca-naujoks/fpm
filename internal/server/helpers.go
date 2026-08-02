package server

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func respondJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(&v)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err)
	}
}

func respondError(w http.ResponseWriter, status int, err error) {
	respondJSON(w, status, map[string]string{
		"error": err.Error(),
	})
}

func ParseIntQuery(r *http.Request, key string) (int, error) {
	return strconv.Atoi(r.URL.Query().Get(key))
}
