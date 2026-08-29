package sqlite

import (
	"financial-planner/internal/models"
	"testing"
	"time"
)

func TestSqliteDB_GetTotalSpend(t *testing.T) {
	db := newTestDatabase(t)

	transactions := []models.Transaction{
		{ProjectId: 1, Description: "Income", Amount: 100},
		{ProjectId: 1, Description: "Rent", Amount: -40},
		{ProjectId: 1, Description: "Food", Amount: -20},
	}

	for _, transaction := range transactions {
		if _, err := db.CreateTransactions(transaction); err != nil {
			t.Fatalf("create transaction: %v", err)
		}
	}

	total, err := db.GetTotalSpend()
	if err != nil {
		t.Fatalf("get total spend: %v", err)
	}

	if total != -60 {
		t.Errorf("expected total spend -60, got %v", total)
	}
}

func TestSqliteDB_GetProjectTransactions(t *testing.T) {
	db := newTestDatabase(t)

	first := models.Transaction{
		ProjectId:   1,
		Description: "Older transaction",
		Amount:      -10,
		Date:        time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
	}
	second := models.Transaction{
		ProjectId:   1,
		Description: "Newer transaction",
		Amount:      -20,
		Date:        time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
	}

	if _, err := db.CreateTransactions(first); err != nil {
		t.Fatalf("create first transaction: %v", err)
	}
	if _, err := db.CreateTransactions(second); err != nil {
		t.Fatalf("create second transaction: %v", err)
	}

	transactions, err := db.GetProjectTransactions(1)
	if err != nil {
		t.Fatalf("get project transactions: %v", err)
	}

	if len(transactions) != 2 {
		t.Fatalf("expected 2 transactions, got %d", len(transactions))
	}

	if transactions[0].Description != "Newer transaction" {
		t.Errorf("expected newest transaction first, got %q", transactions[0].Description)
	}
}

func TestSqliteDB_GetLastTransaction(t *testing.T) {
	db := newTestDatabase(t)

	older := models.Transaction{
		ProjectId:   1,
		Description: "Older transaction",
		Date:        time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
	}

	newer := models.Transaction{
		ProjectId:   1,
		Description: "Newer transaction",
		Date:        time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
	}

	if _, err := db.CreateTransactions(older); err != nil {
		t.Fatalf("create older transaction: %v", err)
	}
	if _, err := db.CreateTransactions(newer); err != nil {
		t.Fatalf("create newer transaction: %v", err)
	}

	transaction, err := db.GetLastTransaction(1)
	if err != nil {
		t.Fatalf("get last transaction: %v", err)
	}

	if transaction.Description != "Newer transaction" {
		t.Errorf("expected newest transaction, got %q", transaction.Description)
	}
}

func TestSqliteDB_UpdateTransactions(t *testing.T) {
	db := newTestDatabase(t)

	transaction := models.Transaction{
		ProjectId:   1,
		Description: "Original",
		Amount:      -10,
		Date:        time.Now(),
	}

	id, err := db.CreateTransactions(transaction)
	if err != nil {
		t.Fatalf("create transaction: %v", err)
	}

	transaction.Id = int(id)
	transaction.Description = "Updated"
	transaction.Amount = -25

	if _, err := db.UpdateTransactions(transaction); err != nil {
		t.Fatalf("update transaction: %v", err)
	}

	updated, err := db.GetLastTransaction(1)
	if err != nil {
		t.Fatalf("get updated transaction: %v", err)
	}

	if updated.Description != "Updated" {
		t.Errorf("expected description %q, got %q", "Updated", updated.Description)
	}

	if updated.Amount != -25 {
		t.Errorf("expected amount -25, got %v", updated.Amount)
	}
}

func TestSqliteDB_DeleteTransactions(t *testing.T) {
	db := newTestDatabase(t)

	id, err := db.CreateTransactions(models.Transaction{
		ProjectId:   1,
		Description: "To delete",
		Amount:      -10,
	})
	if err != nil {
		t.Fatalf("create transaction: %v", err)
	}

	removed, err := db.DeleteTransactions(int(id))
	if err != nil {
		t.Fatalf("delete transaction: %v", err)
	}

	if removed != 1 {
		t.Errorf("expected 1 removed transaction, got %d", removed)
	}

	_, err = db.GetLastTransaction(1)
	if err == nil {
		t.Fatal("expected an error when getting deleted transaction")
	}
}
