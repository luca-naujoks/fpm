package server

import (
	"embed"
	"fmt"
	"net/http"
	"os"
)

type Server struct {
	addr    string
	mux     *http.ServeMux
	content embed.FS
}

func New(addr string, content embed.FS) *Server {
	s := &Server{
		addr:    addr,
		mux:     http.NewServeMux(),
		content: content,
	}

	s.registerStaticRoutes()

	return s
}

func (s *Server) registerStaticRoutes() {
	if _, err := os.Stat("web-app/dist"); err == nil {
		fmt.Println("Serving frontend files from local source")
		registerLocalStaticRoutes(s.mux)
	} else {
		fmt.Println("Serving frontend files from embedded source")
		registerEmbeddedStaticRoutes(s.mux, s.content)
	}
}

func (s *Server) GET(route string, handler http.HandlerFunc) {
	s.mux.HandleFunc(fmt.Sprintf("GET %s", route), handler)
}
func (s *Server) POST(route string, handler http.HandlerFunc) {
	s.mux.HandleFunc(fmt.Sprintf("POST %s", route), handler)
}
func (s *Server) PUT(route string, handler http.HandlerFunc) {
	s.mux.HandleFunc(fmt.Sprintf("PUT %s", route), handler)
}
func (s *Server) DELETE(route string, handler http.HandlerFunc) {
	s.mux.HandleFunc(fmt.Sprintf("DELETE %s", route), handler)
}

func (s *Server) Run() error {
	handler := GzipMiddleware(s.mux)
	return http.ListenAndServe(s.addr, handler)
}
