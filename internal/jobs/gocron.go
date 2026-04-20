package jobs

import (
	"financial-planner/internal/database"
	"financial-planner/internal/models"
	"fmt"
	"time"

	"github.com/go-co-op/gocron/v2"
)

func NewScheduler() {
	schedule, err := gocron.NewScheduler()
	if err != nil {
		errorMessage := fmt.Sprintf("[Job Scheduler] Failed to Init New Scheduler\n %v", err)
		fmt.Println(errorMessage)
		return
	}
	_, err = schedule.NewJob(
		gocron.MonthlyJob(1,
			gocron.NewDaysOfTheMonth(1),
			gocron.NewAtTimes(
				gocron.NewAtTime(00, 00, 00),
			),
		),
		gocron.NewTask(func() {
			monthlyPayIn()
		}),
	)

	schedule.Start()
}

func monthlyPayIn() {
	fmt.Println("[Scheduled Job] Starting Monthly Pay In")
	projects, err := database.GetProjects()
	if err != nil {
		errorMessage := fmt.Sprintf("[Scheduled Job] failed to access projects from database\n %v", err)
		fmt.Println(errorMessage)
		return
	}
	for _, project := range projects {
		transaction := models.Transaction{
			Id:          0,
			ProjectId:   project.Id,
			Description: "Monthly Added budget",
			Amount:      float64(project.Budget),
			Date:        time.Now(),
		}
		_, err := database.CreateTransactions(transaction)
		if err != nil {
			errorMessage := fmt.Sprintf("[Scheduled Job] failed to create Monthly Transaction\n %v", err)
			fmt.Println(errorMessage)
			return
		}
	}
}
