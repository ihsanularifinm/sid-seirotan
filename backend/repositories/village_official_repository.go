package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// VillageOfficialRepository defines the interface for village official data operations
type VillageOfficialRepository interface {
	CreateVillageOfficial(official *models.VillageOfficial) error
	GetVillageOfficialByID(id uint64) (*models.VillageOfficial, error)
	GetAllVillageOfficials() ([]models.VillageOfficial, error)
	UpdateVillageOfficial(official *models.VillageOfficial) error
	DeleteVillageOfficial(id uint64) error
	Count() (int64, error)
}

// GormVillageOfficialRepository implements VillageOfficialRepository using GORM
type GormVillageOfficialRepository struct {
	db *gorm.DB
}

// NewGormVillageOfficialRepository creates a new GormVillageOfficialRepository
func NewGormVillageOfficialRepository(db *gorm.DB) *GormVillageOfficialRepository {
	return &GormVillageOfficialRepository{db: db}
}

// CreateVillageOfficial creates a new village official record in the database
func (r *GormVillageOfficialRepository) CreateVillageOfficial(official *models.VillageOfficial) error {
	return r.db.Create(official).Error
}

// GetVillageOfficialByID retrieves a village official by their ID
func (r *GormVillageOfficialRepository) GetVillageOfficialByID(id uint64) (*models.VillageOfficial, error) {
	var official models.VillageOfficial
	err := r.db.First(&official, id).Error
	return &official, err
}

// GetAllVillageOfficials retrieves all village official records
// Sorted by hamlet_number (nulls last), then display_order
func (r *GormVillageOfficialRepository) GetAllVillageOfficials() ([]models.VillageOfficial, error) {
	var officials []models.VillageOfficial
	err := r.db.Order("hamlet_number ASC NULLS LAST, display_order ASC").Find(&officials).Error
	return officials, err
}

// UpdateVillageOfficial updates an existing village official record in the database
func (r *GormVillageOfficialRepository) UpdateVillageOfficial(official *models.VillageOfficial) error {
	return r.db.Save(official).Error
}

// DeleteVillageOfficial deletes a village official record by their ID (soft delete)
func (r *GormVillageOfficialRepository) DeleteVillageOfficial(id uint64) error {
	return r.db.Delete(&models.VillageOfficial{}, id).Error
}

// Count returns the total number of village officials
func (r *GormVillageOfficialRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.VillageOfficial{}).Count(&count).Error
	return count, err
}
