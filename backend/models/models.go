package models

import (
	"time"

	"gorm.io/gorm"
)

// --- ENUMS ---
type UserRole string
const (
	UserRoleSuperadmin UserRole = "superadmin"
	UserRoleAdmin      UserRole = "admin"
	UserRoleAuthor     UserRole = "author"
)

type NewsStatus string
const (
	NewsStatusDraft     NewsStatus = "draft"
	NewsStatusPublished NewsStatus = "published"
	NewsStatusArchived  NewsStatus = "archived"
)

type PotentialType string
const (
	PotentialTypeUMKM        PotentialType = "umkm"
	PotentialTypeTourism     PotentialType = "tourism"
	PotentialTypeAgriculture PotentialType = "agriculture"
	PotentialTypeOther       PotentialType = "other"
)

// --- TABLES ---
// User represents the users table (for admin login)
type User struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	FullName     string         `gorm:"type:varchar(255);not null" json:"full_name"`
	Username     string         `gorm:"type:varchar(100);unique;not null" json:"username"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"` // Exclude from JSON output
	Role         UserRole       `gorm:"type:user_role;not null;default:'admin'" json:"role"`
	CreatedAt    time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// News represents the news table
type News struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Title           string         `gorm:"type:varchar(255);not null" json:"title"`
	Slug            string         `gorm:"type:varchar(255);unique;not null" json:"slug"`
	Content         string         `gorm:"type:text;not null" json:"content"`
	FeaturedImageURL *string       `gorm:"type:varchar(255)" json:"featured_image_url,omitempty"`
	Status          NewsStatus     `gorm:"type:news_status;not null;default:'draft'" json:"status"`
	AuthorID        uint64         `gorm:"not null" json:"author_id"`
	Author          User           `gorm:"foreignKey:AuthorID" json:"author,omitempty"` // GORM association
	CreatedAt       time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// VillageOfficial represents the village_officials table
type VillageOfficial struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	Position     string         `gorm:"type:varchar(255);not null" json:"position"`
	PhotoURL     *string        `gorm:"type:varchar(255)" json:"photo_url,omitempty"`
	Bio          *string        `gorm:"type:text" json:"bio,omitempty"`
	DisplayOrder int            `gorm:"not null;default:0" json:"display_order"`
	CreatedAt    time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Service represents the services table
type Service struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	ServiceName  string         `gorm:"type:varchar(255);not null" json:"service_name"`
	Description  *string        `gorm:"type:text" json:"description,omitempty"`
	Requirements *string        `gorm:"type:text" json:"requirements,omitempty"`
	CreatedAt    time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Potential represents the potentials table
type Potential struct {
	ID            uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Title         string         `gorm:"type:varchar(255);not null" json:"title"`
	Description   *string        `gorm:"type:text" json:"description,omitempty"`
	CoverImageURL *string        `gorm:"type:varchar(255)" json:"cover_image_url,omitempty"`
	Type          PotentialType  `gorm:"type:potential_type;not null;default:'other'" json:"type"`
	CreatedAt     time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// SiteSetting represents the site_settings table
type SiteSetting struct {
	ID           uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	SettingKey   string         `gorm:"type:varchar(100);unique;not null" json:"setting_key"`
	SettingValue *string        `gorm:"type:text" json:"setting_value,omitempty"`
	SettingGroup string         `gorm:"type:varchar(50);not null;default:'general'" json:"setting_group"`
	CreatedAt    time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// Contact represents the contact_messages table
type Contact struct {
	ID        uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string         `gorm:"type:varchar(255);not null" json:"name"`
	Email     string         `gorm:"type:varchar(255);not null" json:"email"`
	Subject   string         `gorm:"type:varchar(255);not null" json:"subject"`
	Message   string         `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time      `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt time.Time      `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
