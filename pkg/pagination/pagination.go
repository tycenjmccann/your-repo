// Package pagination provides utilities for paginating slices of data.
// It implements 1-indexed page numbers with correct offset calculations.
package pagination

// CalculateOffset computes the offset for a given page and pageSize.
// Pages are 1-indexed, so page 1 returns offset 0.
//
// Fix: Previously used page * pageSize (wrong), now uses (page - 1) * pageSize (correct).
// Bug example: page=3, pageSize=10 -> old: 3*10=30 (skips all), new: (3-1)*10=20 (correct).
func CalculateOffset(page, pageSize int) int {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return (page - 1) * pageSize
}

// Paginate takes a slice of items and returns the subset for the requested page.
// Pages are 1-indexed. Returns an empty slice if the page is beyond available data.
func Paginate[T any](items []T, page, pageSize int) []T {
	offset := CalculateOffset(page, pageSize)
	if offset >= len(items) {
		return []T{}
	}
	end := offset + pageSize
	if end > len(items) {
		end = len(items)
	}
	return items[offset:end]
}

// PaginationResult contains paginated data and metadata.
type PaginationResult[T any] struct {
	Items      []T `json:"items"`
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	TotalItems int `json:"totalItems"`
	TotalPages int `json:"totalPages"`
}

// NewPaginationResult creates a paginated result from a full dataset.
// It calculates the appropriate page of items along with pagination metadata.
func NewPaginationResult[T any](items []T, page, pageSize int) PaginationResult[T] {
	if pageSize < 1 {
		pageSize = 10
	}
	if page < 1 {
		page = 1
	}

	totalItems := len(items)
	totalPages := (totalItems + pageSize - 1) / pageSize

	paginatedItems := Paginate(items, page, pageSize)

	return PaginationResult[T]{
		Items:      paginatedItems,
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}
}
