package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// SiteSettingRepository defines the interface for site setting data operations
type SiteSettingRepository interface {
	CreateSiteSetting(setting *models.SiteSetting) error
	GetSiteSettingByKey(key string) (*models.SiteSetting, error)
	GetAllSiteSettings() ([]models.SiteSetting, error)
	UpdateSiteSetting(setting *models.SiteSetting) error
	DeleteSiteSetting(id uint64) error
}

// GormSiteSettingRepository implements SiteSettingRepository using GORM
type GormSiteSettingRepository struct {
	db *gorm.DB
}

// NewGormSiteSettingRepository creates a new GormSiteSettingRepository
func NewGormSiteSettingRepository(db *gorm.DB) *GormSiteSettingRepository {
	return &GormSiteSettingRepository{db: db}
}

// CreateSiteSetting creates a new site setting record in the database
func (r *GormSiteSettingRepository) CreateSiteSetting(setting *models.SiteSetting) error {
	return r.db.Create(setting).Error
}

// GetSiteSettingByKey retrieves a site setting by its key
func (r *GormSiteSettingRepository) GetSiteSettingByKey(key string) (*models.SiteSetting, error) {
	var setting models.SiteSetting
	err := r.db.Where("setting_key = ?", key).First(&setting).Error
	return &setting, err
}

// GetAllSiteSettings retrieves all site setting records
func (r *GormSiteSettingRepository) GetAllSiteSettings() ([]models.SiteSetting, error) {
	var settings []models.SiteSetting
	err := r.db.Find(&settings).Error
	return settings, err
}

// UpdateSiteSetting updates an existing site setting record in the database
func (r *GormSiteSettingRepository) UpdateSiteSetting(setting *models.SiteSetting) error {
	return r.db.Save(setting).Error
}

// DeleteSiteSetting deletes a site setting record by its ID (soft delete)
func (r *GormSiteSettingRepository) DeleteSiteSetting(id uint64) error {
	return r.db.Delete(&models.SiteSetting{}, id).Error
}
