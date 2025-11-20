package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

type HeroSliderRepository interface {
	GetAll() ([]models.HeroSlider, error)
	GetActive() ([]models.HeroSlider, error)
	GetByID(id uint64) (*models.HeroSlider, error)
	Create(slider *models.HeroSlider) error
	Update(slider *models.HeroSlider) error
	Delete(id uint64) error
}

type GormHeroSliderRepository struct {
	db *gorm.DB
}

func NewGormHeroSliderRepository(db *gorm.DB) HeroSliderRepository {
	return &GormHeroSliderRepository{db: db}
}

func (r *GormHeroSliderRepository) GetAll() ([]models.HeroSlider, error) {
	var sliders []models.HeroSlider
	err := r.db.Order("display_order ASC, created_at DESC").Find(&sliders).Error
	return sliders, err
}

func (r *GormHeroSliderRepository) GetActive() ([]models.HeroSlider, error) {
	var sliders []models.HeroSlider
	err := r.db.Where("is_active = ?", true).Order("display_order ASC, created_at DESC").Find(&sliders).Error
	return sliders, err
}

func (r *GormHeroSliderRepository) GetByID(id uint64) (*models.HeroSlider, error) {
	var slider models.HeroSlider
	err := r.db.First(&slider, id).Error
	if err != nil {
		return nil, err
	}
	return &slider, nil
}

func (r *GormHeroSliderRepository) Create(slider *models.HeroSlider) error {
	return r.db.Create(slider).Error
}

func (r *GormHeroSliderRepository) Update(slider *models.HeroSlider) error {
	return r.db.Save(slider).Error
}

func (r *GormHeroSliderRepository) Delete(id uint64) error {
	return r.db.Delete(&models.HeroSlider{}, id).Error
}
