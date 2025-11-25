package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// PotentialRepository defines the interface for potential data operations
type PotentialRepository interface {
	CreatePotential(potential *models.Potential) error
	GetPotentialByID(id uint64) (*models.Potential, error)
	GetAllPotentials() ([]models.Potential, error)
	UpdatePotential(potential *models.Potential) error
	DeletePotential(id uint64) error
	Count() (int64, error)
}

// GormPotentialRepository implements PotentialRepository using GORM
type GormPotentialRepository struct {
	db *gorm.DB
}

// NewGormPotentialRepository creates a new GormPotentialRepository
func NewGormPotentialRepository(db *gorm.DB) *GormPotentialRepository {
	return &GormPotentialRepository{db: db}
}

// CreatePotential creates a new potential record in the database
func (r *GormPotentialRepository) CreatePotential(potential *models.Potential) error {
	return r.db.Create(potential).Error
}

// GetPotentialByID retrieves a potential by its ID
func (r *GormPotentialRepository) GetPotentialByID(id uint64) (*models.Potential, error) {
	var potential models.Potential
	err := r.db.First(&potential, id).Error
	return &potential, err
}

// GetAllPotentials retrieves all potential records
func (r *GormPotentialRepository) GetAllPotentials() ([]models.Potential, error) {
	var potentials []models.Potential
	err := r.db.Find(&potentials).Error
	return potentials, err
}

// UpdatePotential updates an existing potential record in the database
func (r *GormPotentialRepository) UpdatePotential(potential *models.Potential) error {
	return r.db.Save(potential).Error
}

// DeletePotential deletes a potential record by its ID (soft delete)
func (r *GormPotentialRepository) DeletePotential(id uint64) error {
	return r.db.Delete(&models.Potential{}, id).Error
}

// Count returns the total number of potentials
func (r *GormPotentialRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Potential{}).Count(&count).Error
	return count, err
}
