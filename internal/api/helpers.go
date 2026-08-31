package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func respondJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(v); err != nil {
		// Log the error, but don't call respondError here.
		log.Printf("failed to encode JSON response: %v", err)
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

func ParsePathParam(r *http.Request, key string) string {
	value := r.PathValue(key)
	return value
}
