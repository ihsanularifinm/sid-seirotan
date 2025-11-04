package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// ServiceRepository defines the interface for service data operations
type ServiceRepository interface {
	CreateService(service *models.Service) error
	GetServiceByID(id uint64) (*models.Service, error)
	GetAllServices() ([]models.Service, error)
	UpdateService(service *models.Service) error
	DeleteService(id uint64) error
}

// GormServiceRepository implements ServiceRepository using GORM
type GormServiceRepository struct {
	db *gorm.DB
}

// NewGormServiceRepository creates a new GormServiceRepository
func NewGormServiceRepository(db *gorm.DB) *GormServiceRepository {
	return &GormServiceRepository{db: db}
}

// CreateService creates a new service record in the database
func (r *GormServiceRepository) CreateService(service *models.Service) error {
	return r.db.Create(service).Error
}

// GetServiceByID retrieves a service by its ID
func (r *GormServiceRepository) GetServiceByID(id uint64) (*models.Service, error) {
	var service models.Service
	err := r.db.First(&service, id).Error
	return &service, err
}

// GetAllServices retrieves all service records
func (r *GormServiceRepository) GetAllServices() ([]models.Service, error) {
	var services []models.Service
	err := r.db.Find(&services).Error
	return services, err
}

// UpdateService updates an existing service record in the database
func (r *GormServiceRepository) UpdateService(service *models.Service) error {
	return r.db.Save(service).Error
}

// DeleteService deletes a service record by its ID (soft delete)
func (r *GormServiceRepository) DeleteService(id uint64) error {
	return r.db.Delete(&models.Service{}, id).Error
}
