package repositories

import (
	"time"

	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// PopularPage represents aggregated data for popular pages
type PopularPage struct {
	PageURL   string `json:"page_url"`
	PageTitle string `json:"page_title"`
	ViewCount int64  `json:"view_count"`
}

// PageViewRepository defines methods for page view analytics
type PageViewRepository interface {
	Create(pageView *models.PageView) error
	CountViews(start, end time.Time) (int64, error)
	CountUniqueVisitors(start, end time.Time) (int64, error)
	GetPopularPages(limit int, since time.Time) ([]PopularPage, error)
}

type pageViewRepository struct {
	db *gorm.DB
}

// NewPageViewRepository creates a new instance of PageViewRepository
func NewPageViewRepository(db *gorm.DB) PageViewRepository {
	return &pageViewRepository{db: db}
}

// Create inserts a new page view record
func (r *pageViewRepository) Create(pageView *models.PageView) error {
	return r.db.Create(pageView).Error
}

// CountViews returns the total number of page views within a date range
func (r *pageViewRepository) CountViews(start, end time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.PageView{}).
		Where("viewed_at BETWEEN ? AND ?", start, end).
		Count(&count).Error
	return count, err
}

// CountUniqueVisitors returns the number of unique visitors within a date range
func (r *pageViewRepository) CountUniqueVisitors(start, end time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.PageView{}).
		Where("viewed_at BETWEEN ? AND ?", start, end).
		Distinct("visitor_id").
		Count(&count).Error
	return count, err
}

// GetPopularPages returns the most viewed pages since a given date
func (r *pageViewRepository) GetPopularPages(limit int, since time.Time) ([]PopularPage, error) {
	var pages []PopularPage
	err := r.db.Model(&models.PageView{}).
		Select("page_url, COALESCE(page_title, page_url) as page_title, COUNT(*) as view_count").
		Where("viewed_at >= ?", since).
		Group("page_url, page_title").
		Order("view_count DESC").
		Limit(limit).
		Scan(&pages).Error
	return pages, err
}
