package main

import (
	"embed"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed web-app/dist
var embededContent embed.FS

func ServeEmbeddedFile(c *gin.Context, prefix string, filepath string) {
	// If the path is empty or ends with "/", serve index.html
	if filepath == "" || strings.HasSuffix(filepath, "/") {
		filepath = path.Join(filepath, "index.html")
	}

	// Try to open the file from our embedded filesystem
	fullPath := path.Join("web-app/dist", prefix, filepath)
	f, err := embededContent.Open(fullPath)
	if err != nil {
		// If file not found, serve 404
		fmt.Printf("File not found: %s\n", fullPath)
		http.Error(c.Writer, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		c.Status(http.StatusNotFound)
		return
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	// Serve the file
	http.ServeContent(c.Writer, c.Request, stat.Name(), stat.ModTime(), f.(io.ReadSeeker))
}
