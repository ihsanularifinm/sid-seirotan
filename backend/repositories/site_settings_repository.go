package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

type SiteSettingsRepository interface {
	GetByKey(key string) (*models.SiteSetting, error)
	GetByGroup(group string) ([]models.SiteSetting, error)
	GetAll() ([]models.SiteSetting, error)
	Upsert(setting *models.SiteSetting) error
	BulkUpsert(settings []models.SiteSetting) error
}

type GormSiteSettingsRepository struct {
	db *gorm.DB
}

func NewGormSiteSettingsRepository(db *gorm.DB) SiteSettingsRepository {
	return &GormSiteSettingsRepository{db: db}
}

func (r *GormSiteSettingsRepository) GetByKey(key string) (*models.SiteSetting, error) {
	var setting models.SiteSetting
	err := r.db.Where("setting_key = ?", key).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

func (r *GormSiteSettingsRepository) GetByGroup(group string) ([]models.SiteSetting, error) {
	var settings []models.SiteSetting
	err := r.db.Where("setting_group = ?", group).Find(&settings).Error
	return settings, err
}

func (r *GormSiteSettingsRepository) GetAll() ([]models.SiteSetting, error) {
	var settings []models.SiteSetting
	err := r.db.Find(&settings).Error
	return settings, err
}

func (r *GormSiteSettingsRepository) Upsert(setting *models.SiteSetting) error {
	// Check if setting exists
	var existing models.SiteSetting
	err := r.db.Where("setting_key = ?", setting.SettingKey).First(&existing).Error
	
	if err == gorm.ErrRecordNotFound {
		// Create new
		return r.db.Create(setting).Error
	} else if err != nil {
		return err
	}
	
	// Update existing
	existing.SettingValue = setting.SettingValue
	existing.SettingGroup = setting.SettingGroup
	return r.db.Save(&existing).Error
}

func (r *GormSiteSettingsRepository) BulkUpsert(settings []models.SiteSetting) error {
	// Use transaction for bulk operation
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, setting := range settings {
			var existing models.SiteSetting
			err := tx.Where("setting_key = ?", setting.SettingKey).First(&existing).Error
			
			if err == gorm.ErrRecordNotFound {
				// Create new
				if err := tx.Create(&setting).Error; err != nil {
					return err
				}
			} else if err != nil {
				return err
			} else {
				// Update existing
				existing.SettingValue = setting.SettingValue
				existing.SettingGroup = setting.SettingGroup
				if err := tx.Save(&existing).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
