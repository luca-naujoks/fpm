package server

import (
	"embed"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"
)

func registerLocalStaticRoutes(mux *http.ServeMux) {
	mux.Handle("GET /assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("web-app/dist/assets"))))
	mux.HandleFunc("GET /favicon.svg", serveLocalFile("web-app/dist/favicon.svg"))
	mux.HandleFunc("GET /apple-touch-icon.png", serveLocalFile("web-app/dist/apple-touch-icon.png"))
	mux.HandleFunc("GET /robots.txt", serveLocalFile("web-app/dist/assets/robots.txt"))
	mux.HandleFunc("GET /", serveLocalFile("web-app/dist/index.html"))
}

func registerEmbeddedStaticRoutes(mux *http.ServeMux, content embed.FS) {
	mux.HandleFunc("GET /assets/{filepath}", func(w http.ResponseWriter, r *http.Request) {
		serveEmbeddedFile(w, r, content, "assets", r.PathValue("filepath"))
	})
	mux.HandleFunc("GET /favicon.svg", func(w http.ResponseWriter, r *http.Request) {
		serveEmbeddedFile(w, r, content, "", "favicon.svg")
	})
	mux.HandleFunc("GET /apple-touch-icon.png", func(w http.ResponseWriter, r *http.Request) {
		serveEmbeddedFile(w, r, content, "", "apple-touch-icon.png")
	})
	mux.HandleFunc("GET /robots.txt", func(w http.ResponseWriter, r *http.Request) {
		serveEmbeddedFile(w, r, content, "", "assets/robots.txt")
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			http.NotFound(w, r)
			return
		}
		serveEmbeddedFile(w, r, content, "", "index.html")
	})
}

func serveLocalFile(filePath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filePath)
	}
}

func serveEmbeddedFile(w http.ResponseWriter, r *http.Request, content embed.FS, prefix string, filepath string) {
	// If the path is empty or ends with "/", serve index.html
	if filepath == "" || strings.HasSuffix(filepath, "/") {
		filepath = path.Join(filepath, "index.html")
	}

	fullPath := path.Join("web-app/dist", prefix, filepath)
	f, err := content.Open(fullPath)
	if err != nil {
		// If file not found, serve 404
		fmt.Printf("File not found: %s\n", fullPath)
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	http.ServeContent(w, r, stat.Name(), stat.ModTime(), f.(io.ReadSeeker))
}
