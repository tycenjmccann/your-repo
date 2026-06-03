package pagination

import (
	"testing"
)

func TestCalculateOffset(t *testing.T) {
	tests := []struct {
		name     string
		page     int
		pageSize int
		expected int
	}{
		{"page 1 returns offset 0", 1, 10, 0},
		{"page 2 returns offset 10", 2, 10, 10},
		{"page 3 returns offset 20", 3, 10, 20},
		{"page 1 with pageSize 5", 1, 5, 0},
		{"page 3 with pageSize 5", 3, 5, 10},
		{"zero page defaults to 1", 0, 10, 0},
		{"negative page defaults to 1", -1, 10, 0},
		{"zero pageSize defaults to 10", 1, 0, 0},
		{"negative pageSize defaults to 10", 2, -1, 10},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateOffset(tt.page, tt.pageSize)
			if got != tt.expected {
				t.Errorf("CalculateOffset(%d, %d) = %d, want %d", tt.page, tt.pageSize, got, tt.expected)
			}
		})
	}
}

// TestPaginationLastPageExactlyFull is the key regression test for TEAM-1548.
// With 30 items, pageSize=10, page 3 should return 10 items (items 21-30).
// BUG: Previously offset = page * pageSize = 3*10 = 30, skipping past all items -> 0 results.
// FIX: offset = (page - 1) * pageSize = (3-1)*10 = 20, returning items 21-30 -> 10 results.
func TestPaginationLastPageExactlyFull(t *testing.T) {
	// Create 30 items
	items := make([]int, 30)
	for i := range items {
		items[i] = i + 1
	}

	// Page 3 with pageSize 10 should return last 10 items
	result := Paginate(items, 3, 10)
	if len(result) != 10 {
		t.Fatalf("Paginate(30 items, page=3, pageSize=10) returned %d items, want 10", len(result))
	}
	if result[0] != 21 {
		t.Errorf("First item on page 3 = %d, want 21", result[0])
	}
	if result[9] != 30 {
		t.Errorf("Last item on page 3 = %d, want 30", result[9])
	}
}

// TestPaginateFirstPage verifies page 1 returns the correct first pageSize items.
func TestPaginateFirstPage(t *testing.T) {
	items := make([]int, 30)
	for i := range items {
		items[i] = i + 1
	}

	result := Paginate(items, 1, 10)
	if len(result) != 10 {
		t.Fatalf("Paginate(30 items, page=1, pageSize=10) returned %d items, want 10", len(result))
	}
	if result[0] != 1 {
		t.Errorf("First item on page 1 = %d, want 1", result[0])
	}
	if result[9] != 10 {
		t.Errorf("Last item on page 1 = %d, want 10", result[9])
	}
}

// TestPaginateMiddlePage verifies middle pages return correct items.
func TestPaginateMiddlePage(t *testing.T) {
	items := make([]int, 30)
	for i := range items {
		items[i] = i + 1
	}

	result := Paginate(items, 2, 10)
	if len(result) != 10 {
		t.Fatalf("Paginate(30 items, page=2, pageSize=10) returned %d items, want 10", len(result))
	}
	if result[0] != 11 {
		t.Errorf("First item on page 2 = %d, want 11", result[0])
	}
	if result[9] != 20 {
		t.Errorf("Last item on page 2 = %d, want 20", result[9])
	}
}

// TestPaginatePartialLastPage verifies partial last pages work correctly.
func TestPaginatePartialLastPage(t *testing.T) {
	items := make([]int, 25)
	for i := range items {
		items[i] = i + 1
	}

	result := Paginate(items, 3, 10)
	if len(result) != 5 {
		t.Fatalf("Paginate(25 items, page=3, pageSize=10) returned %d items, want 5", len(result))
	}
	if result[0] != 21 {
		t.Errorf("First item on page 3 = %d, want 21", result[0])
	}
	if result[4] != 25 {
		t.Errorf("Last item on page 3 = %d, want 25", result[4])
	}
}

// TestPaginateBeyondLastPage verifies that requesting beyond available pages returns empty.
func TestPaginateBeyondLastPage(t *testing.T) {
	items := make([]int, 30)
	for i := range items {
		items[i] = i + 1
	}

	result := Paginate(items, 4, 10)
	if len(result) != 0 {
		t.Fatalf("Paginate(30 items, page=4, pageSize=10) returned %d items, want 0", len(result))
	}
}

// TestNewPaginationResult verifies the full pagination result with metadata.
func TestNewPaginationResult(t *testing.T) {
	items := make([]int, 30)
	for i := range items {
		items[i] = i + 1
	}

	result := NewPaginationResult(items, 3, 10)
	if result.TotalItems != 30 {
		t.Errorf("TotalItems = %d, want 30", result.TotalItems)
	}
	if result.TotalPages != 3 {
		t.Errorf("TotalPages = %d, want 3", result.TotalPages)
	}
	if result.Page != 3 {
		t.Errorf("Page = %d, want 3", result.Page)
	}
	if len(result.Items) != 10 {
		t.Fatalf("Items count = %d, want 10", len(result.Items))
	}
	if result.Items[0] != 21 {
		t.Errorf("First item = %d, want 21", result.Items[0])
	}
}

// TestOffsetFormulaRegression explicitly tests the formula to prevent regression.
// This test would FAIL with the old formula: offset = page * pageSize
func TestOffsetFormulaRegression(t *testing.T) {
	// page=3, pageSize=10: old formula gives 30, correct formula gives 20
	offset := CalculateOffset(3, 10)
	if offset != 20 {
		t.Errorf("CalculateOffset(3, 10) = %d, want 20 (regression: old bug returned 30)", offset)
	}

	// page=1, pageSize=10: old formula gives 10, correct formula gives 0
	offset = CalculateOffset(1, 10)
	if offset != 0 {
		t.Errorf("CalculateOffset(1, 10) = %d, want 0 (regression: old bug returned 10)", offset)
	}

	// page=2, pageSize=5: old formula gives 10, correct formula gives 5
	offset = CalculateOffset(2, 5)
	if offset != 5 {
		t.Errorf("CalculateOffset(2, 5) = %d, want 5 (regression: old bug returned 10)", offset)
	}
}

// TestPaginationResultMetadata verifies pagination metadata calculations.
func TestPaginationResultMetadata(t *testing.T) {
	tests := []struct {
		name       string
		totalItems int
		pageSize   int
		wantPages  int
	}{
		{"exact multiple", 30, 10, 3},
		{"with remainder", 25, 10, 3},
		{"single page", 5, 10, 1},
		{"empty", 0, 10, 0},
		{"one item", 1, 10, 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			items := make([]int, tt.totalItems)
			result := NewPaginationResult(items, 1, tt.pageSize)
			if result.TotalPages != tt.wantPages {
				t.Errorf("TotalPages for %d items with pageSize %d = %d, want %d",
					tt.totalItems, tt.pageSize, result.TotalPages, tt.wantPages)
			}
		})
	}
}
