package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// NewsRepository defines the interface for news data operations
type NewsRepository interface {
	CreateNews(news *models.News) error
	GetNewsByID(id uint64) (*models.News, error)
	GetNewsBySlug(slug string) (*models.News, error)
	GetAllNews(page, limit int) ([]models.News, int64, error)
	GetAllNewsForAdmin(page, limit int) ([]models.News, int64, error)
	UpdateNews(news *models.News) error
	DeleteNews(id uint64) error
	IsSlugExist(slug string, currentID uint64) (bool, error)
}

// GormNewsRepository implements NewsRepository using GORM
type GormNewsRepository struct {
	db *gorm.DB
}

// NewGormNewsRepository creates a new GormNewsRepository
func NewGormNewsRepository(db *gorm.DB) *GormNewsRepository {
	return &GormNewsRepository{db: db}
}

// CreateNews creates a new news post in the database
func (r *GormNewsRepository) CreateNews(news *models.News) error {
	return r.db.Create(news).Error
}

// GetNewsByID retrieves a news post by its ID
func (r *GormNewsRepository) GetNewsByID(id uint64) (*models.News, error) {
	var news models.News
	err := r.db.Preload("Author").First(&news, id).Error
	return &news, err
}

// GetNewsBySlug retrieves a news post by its slug
func (r *GormNewsRepository) GetNewsBySlug(slug string) (*models.News, error) {
	var news models.News
	err := r.db.Preload("Author").Where("slug = ?", slug).First(&news).Error
	return &news, err
}

// GetAllNews retrieves all news posts with pagination
func (r *GormNewsRepository) GetAllNews(page, limit int) ([]models.News, int64, error) {
	var news []models.News
	var total int64

	offset := (page - 1) * limit

	// Get total count
	if err := r.db.Model(&models.News{}).Where("status = ?", models.NewsStatusPublished).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated data
	if err := r.db.Preload("Author").Where("status = ?", models.NewsStatusPublished).Order("created_at DESC").Offset(offset).Limit(limit).Find(&news).Error; err != nil {
		return nil, 0, err
	}

	return news, total, nil
}

// GetAllNewsForAdmin retrieves all news posts with pagination for the admin panel
func (r *GormNewsRepository) GetAllNewsForAdmin(page, limit int) ([]models.News, int64, error) {
	var news []models.News
	var total int64

	offset := (page - 1) * limit

	// Get total count
	if err := r.db.Model(&models.News{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated data
	if err := r.db.Preload("Author").Order("created_at DESC").Offset(offset).Limit(limit).Find(&news).Error; err != nil {
		return nil, 0, err
	}

	return news, total, nil
}

// UpdateNews updates an existing news post in the database
func (r *GormNewsRepository) UpdateNews(news *models.News) error {
	return r.db.Save(news).Error
}

// DeleteNews deletes a news post by its ID (soft delete)
func (r *GormNewsRepository) DeleteNews(id uint64) error {
	return r.db.Delete(&models.News{}, id).Error
}

// IsSlugExist checks if a slug already exists for a different news item.
func (r *GormNewsRepository) IsSlugExist(slug string, currentID uint64) (bool, error) {
	var count int64
	query := r.db.Model(&models.News{}).Where("slug = ?", slug)

	// If currentID is provided, exclude it from the search
	// This is used when updating a news item, to check if the new slug
	// conflicts with *other* news items.
	if currentID != 0 {
		query = query.Where("id != ?", currentID)
	}

	err := query.Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
