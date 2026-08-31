package sqlite

import (
	"financial-planner/internal/models"
	"testing"
)

var sampleProjects = []models.Project{
	{
		Id:          0,
		Name:        "Media Library",
		Description: "Digital Media Library",
		Budget:      20,
		Pinned:      true,
	}, {
		Id:          1,
		Name:        "Home Lab",
		Description: "3d Printer, Server stuff...",
		Budget:      50,
		Pinned:      false,
	},
}

func newTestDatabase(t *testing.T) *SqliteDB {
	t.Helper()

	db, err := NewSqliteDatabase(":memory:")
	if err != nil {
		t.Fatalf("create test database: %v", err)
	}

	t.Cleanup(func() {
		if err := db.Close(); err != nil {
			t.Errorf("close test database: %v", err)
		}
	})

	return db
}

func TestSqliteDB_GetProjects(t *testing.T) {
	db := newTestDatabase(t)

	for _, project := range sampleProjects {
		_, err := db.CreateProject(project)
		if err != nil {
			t.Errorf("error creating Project: %s", err.Error())
			return
		}
	}

	projects, err := db.GetProjects()
	if err != nil {
		t.Errorf("Error retrieving Projects: %s", err.Error())
	}

	if len(projects) != 2 {
		t.Errorf("database didnt returned expected amount of projects")
		return
	}
}

func TestSqliteDB_CreateProject(t *testing.T) {
	db := newTestDatabase(t)

	_, err := db.CreateProject(sampleProjects[0])
	if err != nil {
		t.Errorf("error creating sample Project: %s", err.Error())
		return
	}

}

func TestSqliteDB_DeleteProject(t *testing.T) {
	db := newTestDatabase(t)

	projectId, err := db.CreateProject(sampleProjects[0])
	if err != nil {
		t.Errorf("error creating sample Project: %s", err.Error())
		return
	}

	err = db.DeleteProject(int(projectId))
	if err != nil {
		t.Errorf("project Deletion failed with error:%s", err.Error())
		return
	}

	_, err = db.GetProject(int(projectId))
	if err == nil {
		t.Errorf("project was not deleted")
	}
}

func TestSqliteDB_GetProject(t *testing.T) {
	db := newTestDatabase(t)

	id, err := db.CreateProject(sampleProjects[0])
	if err != nil {
		t.Fatalf("create project: %v", err)
	}

	project, err := db.GetProject(int(id))
	if err != nil {
		t.Fatalf("get project: %v", err)
	}

	if project.Id != int(id) {
		t.Errorf("expected project ID %d, got %d", id, project.Id)
	}

	if project.Name != sampleProjects[0].Name {
		t.Errorf("expected project name %q, got %q", sampleProjects[0].Name, project.Name)
	}

	if project.Budget != sampleProjects[0].Budget {
		t.Errorf("expected budget %d, got %d", sampleProjects[0].Budget, project.Budget)
	}
}

func TestSqliteDB_UpdateProject(t *testing.T) {
	db := newTestDatabase(t)

	id, err := db.CreateProject(sampleProjects[0])
	if err != nil {
		t.Fatalf("create project: %v", err)
	}

	updated := sampleProjects[0]
	updated.Id = int(id)
	updated.Name = "Updated project"
	updated.Description = "Updated description"
	updated.Budget = 100

	returnedID, err := db.UpdateProject(updated)
	if err != nil {
		t.Fatalf("update project: %v", err)
	}

	if returnedID != updated.Id {
		t.Errorf("expected returned ID %d, got %d", updated.Id, returnedID)
	}

	project, err := db.GetProject(updated.Id)
	if err != nil {
		t.Fatalf("get updated project: %v", err)
	}

	if project.Name != updated.Name {
		t.Errorf("expected name %q, got %q", updated.Name, project.Name)
	}

	if project.Description != updated.Description {
		t.Errorf("expected description %q, got %q", updated.Description, project.Description)
	}

	if project.Budget != updated.Budget {
		t.Errorf("expected budget %d, got %d", updated.Budget, project.Budget)
	}
}

func TestSqliteDB_GetPinnedProjects(t *testing.T) {
	db := newTestDatabase(t)

	for _, project := range sampleProjects {
		if _, err := db.CreateProject(project); err != nil {
			t.Fatalf("create project: %v", err)
		}
	}

	if err := db.TogglePinnedProject(2); err != nil {
		t.Fatalf("pin project: %v", err)
	}

	projects, err := db.GetPinnedProjects()
	if err != nil {
		t.Fatalf("get pinned projects: %v", err)
	}

	if len(projects) != 2 {
		t.Fatalf("expected 2 pinned projects, got %d", len(projects))
	}

	for _, project := range projects {
		if !project.Pinned {
			t.Errorf("expected project %d to be pinned", project.Id)
		}
	}
}

func TestSqliteDB_TogglePinnedProject(t *testing.T) {
	db := newTestDatabase(t)

	id, err := db.CreateProject(sampleProjects[0])
	if err != nil {
		t.Fatalf("create project: %v", err)
	}

	if err := db.TogglePinnedProject(int(id)); err != nil {
		t.Fatalf("pin project: %v", err)
	}

	project, err := db.GetProject(int(id))
	if err != nil {
		t.Fatalf("get pinned project: %v", err)
	}

	if project.Pinned {
		t.Fatal("expected project to be unpinned")
	}

	if err := db.TogglePinnedProject(int(id)); err != nil {
		t.Fatalf("pin project: %v", err)
	}

	project, err = db.GetProject(int(id))
	if err != nil {
		t.Fatalf("get pinned project: %v", err)
	}

	if !project.Pinned {
		t.Fatal("expected project to be pinned")
	}
}
