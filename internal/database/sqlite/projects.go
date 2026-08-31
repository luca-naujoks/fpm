package sqlite

import (
	"financial-planner/internal/models"
)

func (db *SqliteDB) GetProjects() ([]models.ProjectPreview, error) {
	var projects []models.ProjectPreview
	projects = []models.ProjectPreview{}
	sqlQuery := `SELECT * FROM projects`

	rows, err := db.Query(sqlQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		project := &models.ProjectPreview{}
		err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Budget, &project.Pinned)
		if err != nil {
			return nil, err
		}

		transaction, _ := db.GetLastTransaction(project.Id)
		project.LastTransaction = transaction

		transactions, _ := db.GetProjectTransactions(project.Id)
		total := combineTransactions(transactions)
		project.AvailableBudget = total

		projects = append(projects, *project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}
func (db *SqliteDB) GetProject(id int) (models.ProjectPreview, error) {
	var project models.ProjectPreview
	sqlQuery := `SELECT * FROM projects WHERE id = ?`

	row := db.QueryRow(sqlQuery, id)
	err := row.Scan(&project.Id, &project.Name, &project.Description, &project.Budget, &project.Pinned)
	if err != nil {
		return models.ProjectPreview{}, err
	}

	transaction, _ := db.GetLastTransaction(project.Id)
	project.LastTransaction = transaction

	transactions, _ := db.GetProjectTransactions(project.Id)
	total := combineTransactions(transactions)
	project.AvailableBudget = total

	return project, nil
}

func (db *SqliteDB) CreateProject(project models.Project) (int64, error) {
	sqlQuery := `INSERT INTO projects (name, description, budget, pinned) values (?, ?, ?, ?)`
	result, err := db.Exec(sqlQuery, project.Name, project.Description, project.Budget, project.Pinned)
	if err != nil {
		return 0, err
	}

	projectId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return projectId, nil
}

func (db *SqliteDB) UpdateProject(project models.Project) (int, error) {
	sqlQuery := `UPDATE projects SET name = ?, description = ?, budget = ? WHERE id = ?`
	_, err := db.Exec(sqlQuery, project.Name, project.Description, project.Budget, project.Id)
	if err != nil {
		return 0, err
	}

	return project.Id, nil
}

func (db *SqliteDB) DeleteProject(projectId int) error {
	sqlQueryProject := `DELETE FROM projects WHERE id = ?`
	sqlQueryTransaction := `DELETE FROM transactions WHERE projectId = ?`

	// First Delete Transactions
	transactionResults, err := db.Exec(sqlQueryTransaction, projectId)
	if err != nil {
		return err
	}
	_, err = db.Exec(sqlQueryProject, projectId)
	if err != nil {
		return err
	}

	_, err = transactionResults.RowsAffected()
	if err != nil {
		return err
	}

	return nil
}

func (db *SqliteDB) GetPinnedProjects() ([]models.Project, error) {
	var projects []models.Project
	projects = []models.Project{}

	sqlQuery := "SELECT * FROM projects WHERE pinned = 1"
	rows, err := db.Query(sqlQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		project := &models.Project{}
		err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Budget, &project.Pinned)
		if err != nil {
			return nil, err
		}

		projects = append(projects, *project)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (db *SqliteDB) TogglePinnedProject(id int) error {
	var pinnedState int

	boolTable := map[int]int{
		1: 0,
		0: 1,
	}

	getQuery := "SELECT pinned FROM projects WHERE id = ?"
	row := db.QueryRow(getQuery, id)
	err := row.Scan(&pinnedState)

	if err != nil {
		return err
	}

	updateQuery := "UPDATE projects SET pinned = ? WHERE id = ? "
	_, err = db.Exec(updateQuery, boolTable[pinnedState], id)
	if err != nil {
		return err
	}
	return nil
}
