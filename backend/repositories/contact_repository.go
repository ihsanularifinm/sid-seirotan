package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// ContactRepository defines the interface for contact message data operations
type ContactRepository interface {
	CreateContact(contact *models.Contact) error
	GetAllContacts() ([]models.Contact, error)
}

// GormContactRepository implements ContactRepository using GORM
type GormContactRepository struct {
	db *gorm.DB
}

// NewGormContactRepository creates a new GormContactRepository
func NewGormContactRepository(db *gorm.DB) ContactRepository {
	return &GormContactRepository{db: db}
}

// CreateContact creates a new contact message record in the database
func (r *GormContactRepository) CreateContact(contact *models.Contact) error {
	return r.db.Create(contact).Error
}

// GetAllContacts retrieves all contact messages
func (r *GormContactRepository) GetAllContacts() ([]models.Contact, error) {
	var contacts []models.Contact
	err := r.db.Find(&contacts).Error
	return contacts, err
}
