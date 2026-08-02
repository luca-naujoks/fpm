package database

import (
	"database/sql"
	"financial-planner/internal/models"
)

func GetProjects() ([]models.Project, error) {
	var projects []models.Project
	projects = []models.Project{}
	sqlQuery := `SELECT * FROM projects`

	rows, err := db.Query(sqlQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		project := &models.Project{}
		err := rows.Scan(&project.Id, &project.Name, &project.Description, &project.Budget)
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

func GetBudgetFromProject(projectId int) (float64, error) {
	var sum sql.NullFloat64
	sqlQuery := `SELECT SUM(amount) FROM transactions WHERE projectId = ?`

	row := db.QueryRow(sqlQuery, projectId)

	err := row.Scan(&sum)
	if err != nil {
		return 0, err
	}

	return sum.Float64, nil
}

func CreateProject(project models.Project) (int64, error) {
	sqlQuery := `INSERT INTO projects (name, description, budget) values (?, ?, ?)`
	result, err := db.Exec(sqlQuery, project.Name, project.Description, project.Budget)
	if err != nil {
		return 0, err
	}

	projectId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return projectId, nil
}

func UpdateProject(project models.Project) (int, error) {
	sqlQuery := `UPDATE projects SET name = ?, description = ?, budget = ? WHERE id = ?`
	_, err := db.Exec(sqlQuery, project.Name, project.Description, project.Budget, project.Id)
	if err != nil {
		return 0, err
	}

	return project.Id, nil
}

func DeleteProject(projectId int) error {
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
