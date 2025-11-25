package repositories

import (
	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"gorm.io/gorm"
)

// ContactRepository defines the interface for contact message data operations
type ContactRepository interface {
	CreateContact(contact *models.Contact) error
	GetAllContacts() ([]models.Contact, error)
	Count() (int64, error)
	CountUnread() (int64, error)
	GetRecent(limit int) ([]models.Contact, error)
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

// Count returns the total number of contact messages
func (r *GormContactRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Contact{}).Count(&count).Error
	return count, err
}

// CountUnread returns the number of unread contact messages
// Note: Currently returns 0 as is_read field is not implemented yet
func (r *GormContactRepository) CountUnread() (int64, error) {
	// TODO: Implement when is_read field is added to Contact model
	return 0, nil
}

// GetRecent returns the most recent contact messages
func (r *GormContactRepository) GetRecent(limit int) ([]models.Contact, error) {
	var contacts []models.Contact
	err := r.db.Order("created_at DESC").Limit(limit).Find(&contacts).Error
	return contacts, err
}
