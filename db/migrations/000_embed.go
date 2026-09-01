package migrations

import (
	"embed"
	"io/fs"
)

//go:embed *.sql
var embedded embed.FS

var FS fs.FS = embedded
