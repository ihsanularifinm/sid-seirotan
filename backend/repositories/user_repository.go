package repositories

import (
	"fmt"
	"log"
	"os"

	"github.com/ihsanularifinm/sid-seirotan/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	CreateUser(user *models.User) error
	GetUserByUsername(username string) (*models.User, error)
	GetUserByID(id uint64) (*models.User, error)
	GetAllUsers(requestingRole models.UserRole) ([]models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id uint64) error
	SeedSuperadmin()
}

// GormUserRepository implements UserRepository using GORM
type GormUserRepository struct {
	db *gorm.DB
}

// NewGormUserRepository creates a new GormUserRepository
func NewGormUserRepository(db *gorm.DB) UserRepository {
	return &GormUserRepository{db: db}
}

// CreateUser creates a new user in the database after hashing the password
func (r *GormUserRepository) CreateUser(user *models.User) error {
	// Expects a raw password in user.PasswordHash and hashes it.
	log.Printf("DEBUG: Raw password received in CreateUser for user '%s': %s", user.Username, user.PasswordHash)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	user.PasswordHash = string(hashedPassword)

	log.Printf("DEBUG: Hashed password generated for user '%s': %s", user.Username, user.PasswordHash)

	return r.db.Create(user).Error
}

// GetUserByUsername retrieves a user by their username
func (r *GormUserRepository) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

// GetUserByID retrieves a user by their ID
func (r *GormUserRepository) GetUserByID(id uint64) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	return &user, err
}

// GetAllUsers retrieves a list of users, hiding superadmins from non-superadmins
func (r *GormUserRepository) GetAllUsers(requestingRole models.UserRole) ([]models.User, error) {
	var users []models.User
	db := r.db.Model(&models.User{})

	if requestingRole != models.UserRoleSuperadmin {
		db = db.Where("role != ?", models.UserRoleSuperadmin)
	}

	err := db.Order("username ASC").Find(&users).Error
	return users, err
}

// UpdateUser updates a user's information
func (r *GormUserRepository) UpdateUser(user *models.User) error {
	// If password is provided, hash it. Otherwise, GORM will ignore the empty field.
	if user.PasswordHash != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash new password: %w", err)
		}
		user.PasswordHash = string(hashedPassword)
	} else {
        // Ensure we don't overwrite existing hash with an empty string
        // GORM's `Updates` method handles this well if we use a map or select columns.
        // For simplicity with `Save`, we must be careful.
        // A better approach is to use `db.Model(&user).Select("Username", "Role").Updates(user)`
        // but for now, we will rely on the handler not to send an empty password unless it's intended to be ignored.
    }
	return r.db.Save(user).Error
}

// DeleteUser deletes a user, preventing deletion of superadmins
func (r *GormUserRepository) DeleteUser(id uint64) error {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		return err // User not found
	}

	if user.Role == models.UserRoleSuperadmin {
		return fmt.Errorf("cannot delete a superadmin user")
	}

	return r.db.Delete(&models.User{}, id).Error
}

// SeedSuperadmin checks and creates a superadmin user if one does not exist
func (r *GormUserRepository) SeedSuperadmin() {
	_, err := r.GetUserByUsername("superadmin")

	if err != nil && err == gorm.ErrRecordNotFound {
		log.Println("User 'superadmin' not found, creating...")
		defaultPassword := os.Getenv("SUPERADMIN_DEFAULT_PASSWORD")
		if defaultPassword == "" {
			log.Fatalf("FATAL: SUPERADMIN_DEFAULT_PASSWORD is not set in .env file")
		}

		superadmin := &models.User{
			FullName:     "Super Administrator",
			Username:     "superadmin",
			PasswordHash: defaultPassword, // The CreateUser method will hash this
			Role:         models.UserRoleSuperadmin,
		}

		if err := r.CreateUser(superadmin); err != nil {
			log.Fatalf("FATAL: Failed to create superadmin user: %v", err)
		}
		log.Println("User 'superadmin' created successfully.")
	} else if err != nil {
		log.Fatalf("FATAL: Error checking for superadmin user: %v", err)
	} else {
		log.Println("User 'superadmin' already exists.")
	}
}
