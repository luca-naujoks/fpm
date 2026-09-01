package database

import "testing"

func TestNewDatabase(t *testing.T) {
	_, err := NewDatabase(":memory:", "sqlite")
	if err == nil {
		t.Fatalf("sqlite is not a valid db Type. Should be sqlite3")
	}

	_, err = NewDatabase(":memory:", "sqlite3")
	if err != nil {
		t.Fatal(err.Error())
	}

}
